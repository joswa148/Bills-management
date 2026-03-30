import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
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
  priceINR: z.number().min(0, 'Price must be 0 or positive'),
  priceAED: z.number().min(0, 'Price must be 0 or positive'),
  validityDate: z.any().refine((val) => val !== null, 'Validity date is required'),
  paymentMethod: z.string().min(2, 'Payment method is required'),
  bankName: z.string().min(2, 'Bank is required'),
  region: z.enum(['India', 'UAE']),
  status: z.enum(['active', 'cancelled', 'paused']),
  invoiceId: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  poNumber: z.string().optional().nullable(),
  issueDate: z.any().optional().nullable(),
  dueDate: z.any().optional().nullable(),
  subtotal: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  amountDue: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export default function SubscriptionForm({ open, onCancel, initialValues }) {
  const { addSubscription, updateSubscription } = useSubscriptionStore();
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'monthly',
      region: 'India',
      status: 'active',
    }
  });

  const handleScanSuccess = (data) => {
    reset({
      ...data,
      validityDate: data.validityDate ? dayjs(data.validityDate) : null,
      issueDate: data.issueDate ? dayjs(data.issueDate) : null,
      dueDate: data.dueDate ? dayjs(data.dueDate) : null,
      status: data.status || 'active',
      period: data.period || 'monthly',
      region: data.region || 'India'
    });
  };

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        validityDate: initialValues.validityDate ? dayjs(initialValues.validityDate) : null,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
      });
    } else {
      reset({
        period: 'monthly',
        region: 'India',
        status: 'active',
        serviceName: '',
        category: 'General',
        priceINR: 0,
        priceAED: 0,
        invoiceId: '',
        poNumber: '',
        subject: '',
        notes: '',
        subtotal: 0,
        discount: 0,
        amountDue: 0
      });
    }
  }, [initialValues, reset, open]);

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      validityDate: data.validityDate ? data.validityDate.format('YYYY-MM-DD') : null,
      issueDate: data.issueDate && data.issueDate.isValid ? data.issueDate.format('YYYY-MM-DD') : null,
      dueDate: data.dueDate && data.dueDate.isValid ? data.dueDate.format('YYYY-MM-DD') : null,
    };

    try {
      if (initialValues) {
        await updateSubscription(initialValues.id, formattedData);
        toast.success(`${data.serviceName} updated successfully`);
      } else {
        await addSubscription(formattedData);
        toast.success(`${data.serviceName} added successfully`);
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

          <Form.Item label="Billing Period">
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

          <Form.Item label="Validity Date" validateStatus={errors.validityDate ? 'error' : ''} help={errors.validityDate?.message}>
            <Controller
              name="validityDate"
              control={control}
              render={({ field }) => <DatePicker {...field} className="w-full rounded-xl py-2.5" />}
            />
          </Form.Item>

          <div className="col-span-2 mt-6 mb-2 pb-2 border-b border-secondary-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            <span className="text-sm font-bold text-secondary-700 uppercase tracking-wider">Invoice Details</span>
          </div>

          <Form.Item label="Invoice ID" validateStatus={errors.invoiceId ? 'error' : ''} help={errors.invoiceId?.message}>
            <Controller
              name="invoiceId"
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

          <Form.Item label="Subject" className="col-span-2" validateStatus={errors.subject ? 'error' : ''} help={errors.subject?.message}>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Invoice for Monthly Subscription" className="rounded-xl py-2.5" />}
            />
          </Form.Item>

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

          <Form.Item label="Price (INR)" validateStatus={errors.priceINR ? 'error' : ''} help={errors.priceINR?.message}>
            <Controller
              name="priceINR"
              control={control}
              render={({ field }) => <InputNumber {...field} className="w-full rounded-xl py-2" placeholder="0" />}
            />
          </Form.Item>

          <Form.Item label="Price (AED)" validateStatus={errors.priceAED ? 'error' : ''} help={errors.priceAED?.message}>
            <Controller
              name="priceAED"
              control={control}
              render={({ field }) => <InputNumber {...field} className="w-full rounded-xl py-2" placeholder="0" />}
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
