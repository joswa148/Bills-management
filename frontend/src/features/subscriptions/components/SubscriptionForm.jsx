import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import BillScanner from './BillScanner';

const schema = z.object({
  name: z.string().min(2, 'Service name is required'),
  category: z.string().min(2, 'Category is required'),
  period: z.enum(['Monthly', 'Yearly', 'Quarterly']),
  priceINR: z.number().positive('Price must be positive'),
  priceAED: z.number().positive('Price must be positive'),
  validityDate: z.any().refine((val) => val !== null, 'Validity date is required'),
  paymentMethod: z.string().min(2, 'Payment method is required'),
  bank: z.string().min(2, 'Bank is required'),
  region: z.enum(['India', 'UAE']),
  status: z.enum(['Active', 'Inactive']),
});

export default function SubscriptionForm({ open, onCancel, initialValues }) {
  const { addSubscription, updateSubscription } = useSubscriptionStore();
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'Monthly',
      region: 'India',
      status: 'Active',
    }
  });

  const handleScanSuccess = (data) => {
    reset({
      ...data,
      validityDate: dayjs(data.validityDate),
      name: data.serviceName, // Backend returns serviceName, frontend uses name
      bank: data.bankName,    // Backend returns bankName, frontend uses bank
      status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1)) : 'Active',
      period: data.period ? (data.period.charAt(0).toUpperCase() + data.period.slice(1)) : 'Monthly',
      region: data.region || 'India'
    });
  };

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        validityDate: dayjs(initialValues.validityDate),
      });
    } else {
      reset({
        period: 'Monthly',
        region: 'India',
        status: 'Active',
      });
    }
  }, [initialValues, reset, open]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      id: initialValues?.id || `sub_${new Date().getTime()}`,
      validityDate: data.validityDate.format('YYYY-MM-DD'),
      logo: `https://logo.clearbit.com/${data.name.toLowerCase().replace(/\s+/g, '')}.com`
    };

    if (initialValues) {
      updateSubscription(initialValues.id, formattedData);
    } else {
      addSubscription(formattedData);
    }
    
    onCancel();
    reset();
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
          <Form.Item label="Service Name" validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
            <Controller
              name="name"
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
                  <Select.Option value="Monthly">Monthly</Select.Option>
                  <Select.Option value="Yearly">Yearly</Select.Option>
                  <Select.Option value="Quarterly">Quarterly</Select.Option>
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

          <Form.Item label="Bank" validateStatus={errors.bank ? 'error' : ''} help={errors.bank?.message}>
            <Controller
              name="bank"
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
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Inactive">Inactive</Select.Option>
                </Select>
              )}
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
