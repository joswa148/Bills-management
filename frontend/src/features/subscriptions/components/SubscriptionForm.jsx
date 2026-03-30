import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Space, Table, Divider } from 'antd';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, MapPin, Building, List } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
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
  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'monthly',
      region: 'India',
      status: 'active',
      items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
      currency: 'INR'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");

  // Calculate totals when items change
  useEffect(() => {
    if (watchItems) {
      const subtotal = watchItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
      setValue('subtotal', subtotal);
      const discount = watch('discount') || 0;
      setValue('amountDue', Math.max(0, subtotal - discount));
    }
  }, [watchItems, setValue, watch]);

  const handleScanSuccess = (data) => {
    reset({
      ...data,
      issueDate: data.issueDate ? dayjs(data.issueDate) : dayjs(),
      dueDate: data.dueDate ? dayjs(data.dueDate) : null,
      status: data.status || 'active',
      period: data.period || 'monthly',
      region: data.region || 'India',
      invoiceIdNumber: data.invoiceId, // Map from scanner ID to our new schema
      items: data.items && data.items.length > 0 ? data.items : [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
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
      }
      onCancel();
      reset();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  return (
    <Modal
      title={<span className="text-xl font-bold text-secondary-900">{initialValues ? 'Edit Subscription' : 'Add New Subscription'}</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="premium-modal"
      centered
    >
      {!initialValues && <BillScanner onScanSuccess={handleScanSuccess} />}
      
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-6">
        <div className="grid grid-cols-2 gap-x-6">
          <div className="col-span-2 mt-4 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Service Details</span>
          </div>

          <Form.Item label="Service Name" validateStatus={errors.serviceName ? 'error' : ''} help={errors.serviceName?.message}>
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

          <Form.Item label="Sender Address (From)" className="col-span-2">
            <Controller
              name="senderAddress"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={3} placeholder="Company Name&#10;Address Line 1&#10;City, State, ZIP" className="rounded-xl font-mono text-xs" />
              )}
            />
          </Form.Item>

          <Form.Item label="Client Address (Invoice For)" className="col-span-2">
            <Controller
              name="clientAddress"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} rows={3} placeholder="Client Name&#10;Address Line 1&#10;City, State, ZIP" className="rounded-xl font-mono text-xs" />
              )}
            />
          </Form.Item>

          <div className="col-span-2 mt-6 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Invoice Identification</span>
          </div>

          <Form.Item label="Invoice ID #" validateStatus={errors.invoiceIdNumber ? 'error' : ''} help={errors.invoiceIdNumber?.message}>
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

          <Form.Item label="Issue Date" validateStatus={errors.issueDate ? 'error' : ''} help={errors.issueDate?.message}>
            <Controller
              name="issueDate"
              control={control}
              render={({ field }) => <DatePicker {...field} className="w-full rounded-xl py-2.5" />}
            />
          </Form.Item>

          <Form.Item label="Due Date" validateStatus={errors.dueDate ? 'error' : ''} help={errors.dueDate?.message}>
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
                          render={({ field }) => <InputNumber {...field} bordered={false} className="w-full text-xs" />}
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
                                setValue(`items.${index}.amount`, (val || 0) * qty);
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
          <Button onClick={onCancel} className="rounded-xl px-6 h-11 font-bold text-secondary-500 hover:text-secondary-700">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" className="rounded-xl px-8 h-11 bg-primary-600 font-bold shadow-lg shadow-primary-500/20">
            {initialValues ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </div>
      </Form>
      
      <style>{`
        .premium-select .ant-select-selector {
          border-radius: 0.75rem !important;
          padding: 4px 12px !important;
          height: 44px !important;
          display: flex !important;
          items-center !important;
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
