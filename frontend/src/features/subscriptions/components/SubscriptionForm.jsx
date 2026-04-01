import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Space, Table, Divider } from 'antd';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, MapPin, Building, List } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { billsApi } from '../../../lib/api/billsApi';
import BillScanner from './BillScanner';

const schema = z.object({
  serviceName: z.string().min(2, 'Service name is required'),
  category: z.string().min(2, 'Category is required'),
  period: z.enum(['monthly', 'yearly', 'quarterly']),
  senderAddress: z.string().optional().nullable(),
  clientAddress: z.string().optional().nullable(),
  invoiceIdNumber: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  issueDate: z.any().refine((val) => val !== null, 'Issue date is required'),
  dueDate: z.any().optional().nullable(),
  poNumber: z.string().optional().nullable(),
  subtotal: z.number().min(0),
  discount: z.number().optional().nullable(),
  amountDue: z.number().min(0),
  currency: z.string().default('INR'),
  paymentMethod: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  cardLast4: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  region: z.enum(['India', 'UAE']),
  status: z.enum(['active', 'cancelled', 'paused']),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    amount: z.number().min(0)
  })).optional()
});

export default function SubscriptionForm({ open, onCancel, initialValues }) {
  const { addSubscription, updateSubscription } = useSubscriptionStore();

  // ── Confidence & Split View State (populated after a scan) ───────────────
  const [fieldConfidence, setFieldConfidence] = useState({});
  const [scanMeta, setScanMeta] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [rawServiceName, setRawServiceName] = useState('');

  const handleClose = () => {
    setDocumentUrl(null);
    setRawServiceName('');
    setScanMeta(null);
    setFieldConfidence({});
    reset();
    onCancel();
  };

  // Renders a small confidence badge next to a form label
  const ConfidenceBadge = ({ field }) => {
    const score = fieldConfidence[field];
    if (!score) return null;
    const pct = Math.round(score * 100);
    const cls = score >= 0.9
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : score >= 0.7
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-red-100 text-red-600 border-red-200';
    const icon = score >= 0.9 ? '✓' : score >= 0.7 ? '⚠' : '!';
    return (
      <span
        className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cls}`}
        title={`AI confidence: ${pct}%`}
      >
        {icon} {pct}%
      </span>
    );
  };

  // Wraps a label string with an optional confidence badge
  const fieldLabel = (label, field) => (
    <span className="flex items-center">{label}<ConfidenceBadge field={field} /></span>
  );

  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'monthly',
      region: 'India',
      status: 'active',
      subtotal: 0,
      discount: 0,
      amountDue: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
      currency: 'INR'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Track discount reactively so the auto-calc is always accurate
  const watchDiscount = watch('discount') || 0;

  // NOTE: This effect ONLY recalculates when the user manually edits items.
  // It does NOT run after a scan because we use a "scanLock" flag.
  // We use a ref to prevent overwriting values that were just set by the scanner.
  const scanJustHappened = React.useRef(false);

  const watchItems = watch('items');

  useEffect(() => {
    // Skip the recalc immediately after a scan — the scan already set correct values
    if (scanJustHappened.current) {
      scanJustHappened.current = false;
      return;
    }
    if (watchItems) {
      const subtotal = watchItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
      setValue('subtotal', subtotal, { shouldValidate: false });
      setValue('amountDue', Math.max(0, subtotal - watchDiscount), { shouldValidate: false });
    }
  }, [watchItems]); // Only re-run when items change, NOT when discount changes

  const handleScanSuccess = (data, docUrl) => {
    // Set the lock flag so the useEffect does NOT overwrite amounts on this cycle
    scanJustHappened.current = true;

    // Extract per-field confidence scores and scan metadata from OCR response
    if (data._confidence) setFieldConfidence(data._confidence);
    if (data._meta)       setScanMeta(data._meta);
    if (docUrl)           setDocumentUrl(docUrl);
    setRawServiceName(data.rawServiceName || '');

    reset({
      // Service Info
      serviceName: data.serviceName || '',
      category: data.category || 'General',
      period: data.period || 'monthly',
      region: data.region || 'India',
      status: data.status || 'active',

      // Addresses
      senderAddress: data.senderAddress || '',
      clientAddress: data.clientAddress || '',

      // Invoice Identification — key mapping: invoiceId (OCR) → invoiceIdNumber (form)
      invoiceIdNumber: data.invoiceId || '',
      subject: data.subject || '',
      poNumber: data.poNumber || '',

      // Dates
      issueDate: data.issueDate ? dayjs(data.issueDate) : dayjs(),
      dueDate: data.dueDate ? dayjs(data.dueDate) : null,

      // Financials — these are preserved by the scan lock (not overwritten by useEffect)
      subtotal: typeof data.subtotal === 'number' ? data.subtotal : 0,
      discount: typeof data.discount === 'number' ? data.discount : 0,
      amountDue: typeof data.amountDue === 'number' ? data.amountDue : 0,
      currency: data.currency || 'INR',

      // Payment
      paymentMethod: data.paymentMethod || '',
      bankName: data.bankName || '',
      cardLast4: data.cardLast4 ? String(data.cardLast4) : '',

      // Line Items
      items: (data.items && data.items.length > 0)
        ? data.items.map(item => ({
            description: item.description || '',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            amount: Number(item.amount) || 0,
          }))
        : [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],

      // Notes
      notes: data.notes || '',
    });
  };

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : dayjs(),
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
      });
    } else {
      reset({
        period: 'monthly',
        region: 'India',
        status: 'active',
        serviceName: '',
        category: 'General',
        subtotal: 0,
        discount: 0,
        amountDue: 0,
        currency: 'INR',
        items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
      });
    }
  }, [initialValues, reset, open]);

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      issueDate: data.issueDate ? data.issueDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      dueDate: data.dueDate && data.dueDate.isValid ? data.dueDate.format('YYYY-MM-DD') : null,
    };

    try {
      if (initialValues) {
        // We'll update master subscription if needed, or just create new invoice
        toast.error('Direct editing of historical invoices disabled for integrity');
      } else {
        await addSubscription(formattedData);
        toast.success(`Invoice for ${data.serviceName} processed successfully`);

        // Feedback loop: If the user changed the vendor name from the raw AI extraction, teach the backend
        if (rawServiceName && rawServiceName !== formattedData.serviceName) {
          billsApi.mapVendor(rawServiceName, formattedData.serviceName).catch(err => console.error('Alias mapping failed:', err));
        }
      }
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  return (
    <Modal
      title={<span className="text-xl font-bold text-secondary-900">{initialValues ? 'Edit Subscription' : 'Add New Subscription'}</span>}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={documentUrl ? 1100 : 600}
      className="premium-modal"
      centered
      style={documentUrl ? { top: 20 } : undefined}
    >
      <div className={documentUrl ? "flex gap-6 mt-4 h-[75vh]" : ""}>
        {/* Left Pane (Document Preview) */}
        {documentUrl && (
          <div className="w-1/2 h-full rounded-2xl overflow-hidden border border-secondary-200 bg-secondary-50 relative">
            <object data={documentUrl} className="w-full h-full absolute inset-0" type="application/pdf">
              <iframe src={documentUrl} className="w-full h-full" title="Document Preview" />
            </object>
          </div>
        )}

        {/* Right Pane (Form & Scanner) */}
        <div className={documentUrl ? "w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar" : ""}>
          {!initialValues && <BillScanner onScanSuccess={handleScanSuccess} />}

          {/* ── Scan Confidence Banner (shown after a successful scan) ────── */}
      {scanMeta && (
        <div className={`mb-4 px-4 py-3 rounded-2xl border flex items-center justify-between ${
          scanMeta.overallConfidence >= 0.9
            ? 'bg-emerald-50 border-emerald-200'
            : scanMeta.overallConfidence >= 0.7
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {scanMeta.overallConfidence >= 0.9 ? '🎯' : scanMeta.overallConfidence >= 0.7 ? '⚠️' : '🔴'}
            </span>
            <div>
              <p className="text-sm font-bold text-secondary-800">
                AI Confidence: {Math.round(scanMeta.overallConfidence * 100)}% &nbsp;
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  scanMeta.overallConfidence >= 0.9 ? 'bg-emerald-200 text-emerald-800'
                  : 'bg-amber-200 text-amber-800'
                }`}>
                  {scanMeta.overallConfidence >= 0.9 ? 'High Accuracy' : scanMeta.overallConfidence >= 0.7 ? 'Review Marked Fields' : 'Manual Review Needed'}
                </span>
              </p>
              <p className="text-xs text-secondary-500">
                {scanMeta.fieldsExtracted} fields extracted via <strong>{scanMeta.provider === 'mindee' ? 'Mindee AI' : 'Smart Mock OCR'}</strong>
                {scanMeta.overallConfidence < 0.9 && ' — fields marked ⚠ need your review'}
              </p>
            </div>
          </div>
          <button onClick={() => { setScanMeta(null); setFieldConfidence({}); setDocumentUrl(null); }} className="text-secondary-400 hover:text-secondary-600 text-lg leading-none">&times;</button>
        </div>
      )}
      
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className={documentUrl ? "mt-4" : "mt-6"}>
        <div className="grid grid-cols-2 gap-x-6">
          <div className="col-span-2 mt-4 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Service Details</span>
          </div>

          <Form.Item label={fieldLabel('Service Name', 'serviceName')} validateStatus={errors.serviceName ? 'error' : ''} help={errors.serviceName?.message}>
            <Controller
              name="serviceName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="e.g. Netflix" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label="Category" validateStatus={errors.category ? 'error' : ''} help={errors.category?.message}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => <Input {...field} placeholder="e.g. Entertainment" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label="Subscription Period">
            <Controller
              name="period"
              control={control}
              render={({ field }) => (
                <Select {...field} className="premium-select">
                  <Select.Option value="monthly">Monthly</Select.Option>
                  <Select.Option value="yearly">Yearly</Select.Option>
                  <Select.Option value="quarterly">Quarterly</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <div className="col-span-2 mt-6 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Address Details</span>
          </div>

          <Form.Item label={fieldLabel('Sender Address (From)', 'senderAddress')} className="col-span-2">
            <Controller
              name="senderAddress"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={3} placeholder={"Company Name\nAddress Line 1\nCity, State, ZIP"} className="rounded-xl font-mono text-xs" />
              )}
            />
          </Form.Item>

          <Form.Item label={fieldLabel('Client Address (Invoice For)', 'clientAddress')} className="col-span-2">
            <Controller
              name="clientAddress"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={3} placeholder={"Client Name\nAddress Line 1\nCity, State, ZIP"} className="rounded-xl font-mono text-xs" />
              )}
            />
          </Form.Item>

          <div className="col-span-2 mt-6 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Invoice Identification</span>
          </div>

          <Form.Item label={fieldLabel('Invoice ID #', 'invoiceIdNumber')} validateStatus={errors.invoiceIdNumber ? 'error' : ''} help={errors.invoiceIdNumber?.message}>
            <Controller
              name="invoiceIdNumber"
              control={control}
              render={({ field }) => <Input {...field} placeholder="e.g. INV-001" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label="PO Number" validateStatus={errors.poNumber ? 'error' : ''} help={errors.poNumber?.message}>
            <Controller
              name="poNumber"
              control={control}
              render={({ field }) => <Input {...field} placeholder="PO-5678" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label={fieldLabel('Issue Date', 'issueDate')} validateStatus={errors.issueDate ? 'error' : ''} help={errors.issueDate?.message}>
            <Controller
              name="issueDate"
              control={control}
              render={({ field }) => <DatePicker {...field} className="w-full rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label={fieldLabel('Due Date', 'dueDate')} validateStatus={errors.dueDate ? 'error' : ''} help={errors.dueDate?.message}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => <DatePicker {...field} className="w-full rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label="Subject / Description" className="col-span-2" validateStatus={errors.subject ? 'error' : ''} help={errors.subject?.message}>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => <Input {...field} placeholder="e.g. Software Consulting Services" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

          <div className="col-span-2 mt-6 mb-4 pb-2 border-b border-secondary-100 flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
              <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Line Items</span>
            </div>
            <Button 
              type="dashed" 
              size="small" 
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0, amount: 0 })}
              icon={<Plus size={14} />}
              className="rounded-lg flex items-center"
            >
              Add Item
            </Button>
          </div>

          <div className="col-span-2 mb-6">
            <div className="bg-secondary-50 rounded-2xl overflow-hidden border border-secondary-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-100/50 text-[10px] font-bold text-secondary-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 w-20">Qty</th>
                    <th className="px-4 py-3 w-32">Price</th>
                    <th className="px-4 py-3 w-32">Amount</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-2 py-2">
                        <Controller
                          name={`items.${index}.description`}
                          control={control}
                          render={({ field }) => <Input {...field} placeholder="Item description" bordered={false} className="text-xs" />}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              {...field}
                              bordered={false}
                              className="w-full text-xs"
                              min={1}
                              onChange={(val) => {
                                field.onChange(val);
                                const price = watch(`items.${index}.unitPrice`) || 0;
                                setValue(`items.${index}.amount`, (val || 0) * price, { shouldValidate: false });
                              }}
                            />
                          )}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Controller
                          name={`items.${index}.unitPrice`}
                          control={control}
                          render={({ field }) => (
                            <InputNumber 
                              {...field} 
                              bordered={false} 
                              className="w-full text-xs" 
                              onChange={(val) => {
                                field.onChange(val);
                                const qty = watch(`items.${index}.quantity`) || 1;
                                setValue(`items.${index}.amount`, (val || 0) * qty, { shouldValidate: false });
                              }}
                            />
                          )}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Controller
                          name={`items.${index}.amount`}
                          control={control}
                          render={({ field }) => <InputNumber {...field} bordered={false} readOnly className="w-full text-xs font-bold" />}
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Button 
                          type="text" 
                          danger 
                          size="small" 
                          icon={<Trash2 size={14} />} 
                          onClick={() => remove(index)}
                          className="flex items-center justify-center opacity-50 hover:opacity-100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          <div className="col-span-2 mt-6 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Financials & Payment</span>
          </div>

          <Form.Item label="Subtotal" validateStatus={errors.subtotal ? 'error' : ''} help={errors.subtotal?.message}>
            <Controller
              name="subtotal"
              control={control}
              render={({ field }) => <InputNumber {...field} className="w-full rounded-xl py-2" placeholder="0" />}
            />
          </Form.Item>

          <Form.Item label="Discount" validateStatus={errors.discount ? 'error' : ''} help={errors.discount?.message}>
            <Controller
              name="discount"
              control={control}
              render={({ field }) => <InputNumber {...field} className="w-full rounded-xl py-2" placeholder="0" />}
            />
          </Form.Item>

          <Form.Item label="Final Amount Due" className="col-span-2" validateStatus={errors.amountDue ? 'error' : ''} help={errors.amountDue?.message}>
            <Controller
              name="amountDue"
              control={control}
              render={({ field }) => (
                <InputNumber 
                  {...field} 
                  className="w-full rounded-xl py-2 bg-primary-50 font-bold text-primary-900 border-primary-200" 
                  placeholder="0"
                  prefix={<span className="text-secondary-400 font-medium">INR</span>}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Payment Method" validateStatus={errors.paymentMethod ? 'error' : ''} help={errors.paymentMethod?.message}>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => <Input {...field} placeholder="e.g. Visa 4242" className="rounded-xl py-2.5" />}
            />
          </Form.Item>


          <Form.Item label="Bank" validateStatus={errors.bankName ? 'error' : ''} help={errors.bankName?.message}>
            <Controller
              name="bankName"
              control={control}
              render={({ field }) => <Input {...field} placeholder="e.g. HDFC" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label="Region">
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select {...field} className="premium-select">
                  <Select.Option value="India">India</Select.Option>
                  <Select.Option value="UAE">UAE</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Status">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} className="premium-select">
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                  <Select.Option value="paused">Paused</Select.Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Notes" className="col-span-2" validateStatus={errors.notes ? 'error' : ''} help={errors.notes?.message}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={3} placeholder="Add any additional notes here..." className="rounded-xl" />}
            />
          </Form.Item>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-secondary-50">
          <Button onClick={handleClose} className="rounded-xl px-6 h-11 font-bold text-secondary-500 hover:text-secondary-700">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" className="rounded-xl px-8 h-11 bg-primary-600 font-bold shadow-lg shadow-primary-500/20">
            {initialValues ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </div>
      </Form>
      
      </div> {/* Close right pane wrapper */}
      </div> {/* Close split-view outer wrapper */}
      
      <style>{`
        .premium-select .ant-select-selector {
          border-radius: 0.75rem !important;
          padding: 4px 12px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
        .premium-modal .ant-modal-content {
          border-radius: 2rem;
          padding: 2.5rem;
        }
        .ant-form-item-label label {
          font-weight: 700 !important;
          color: #64748b !important;
          font-size: 13px !important;
          margin-bottom: 4px !important;
        }
      `}</style>
    </Modal>
  );
}
