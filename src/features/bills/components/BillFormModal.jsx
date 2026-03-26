import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

export default function BillFormModal({ open, onCancel, onSubmit, initialData }) {
  const [form] = Form.useForm();
  const priceINR = Form.useWatch('priceINR', form);
  const period = Form.useWatch('period', form);

  const totalYearly = React.useMemo(() => {
    if (!priceINR || !period) return 0;
    if (period === 'Monthly') return priceINR * 12;
    return priceINR;
  }, [priceINR, period]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          validity: initialData.validity ? dayjs(initialData.validity) : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        totalYearly: totalYearly,
        validity: values.validity ? values.validity.format('YYYY-MM-DD') : null
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Bill" : "Add New Bill"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      okText={initialData ? "Update" : "Add"}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="productService"
          label="Product/Service"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="e.g. Cloud Hosting" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="period" label="Period" rules={[{ required: true }]}>
            <Select placeholder="Select period">
              <Option value="Monthly">Monthly</Option>
              <Option value="Yearly">Yearly</Option>
              <Option value="One-Time">One-Time</Option>
            </Select>
          </Form.Item>

          <Form.Item name="validity" label="Valid Until" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="priceINR" label="Price (INR)" rules={[{ required: true }]}>
            <InputNumber className="w-full" prefix="₹" />
          </Form.Item>

          <Form.Item label="Total Yearly (Calculated)" className="mb-0">
             <div className="h-8 flex items-center px-3 bg-gray-50 border border-gray-200 rounded text-gray-600 font-semibold">
               ₹{totalYearly.toLocaleString()}
             </div>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Form.Item name="priceAED" label="Price (AED)" rules={[{ required: true }]}>
             <InputNumber className="w-full" suffix="AED" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="paymentMethod" label="Payment Method" rules={[{ required: true }]}>
            <Select placeholder="Select method">
              <Option value="Credit Card">Credit Card</Option>
              <Option value="Debit Card">Debit Card</Option>
              <Option value="Bank Transfer">Bank Transfer</Option>
            </Select>
          </Form.Item>

          <Form.Item name="bank" label="Bank" rules={[{ required: true }]}>
            <Input placeholder="e.g. HDFC Bank" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="region" label="Region" rules={[{ required: true }]}>
            <Select placeholder="Select region">
              <Option value="India">India</Option>
              <Option value="UAE">UAE</Option>
              <Option value="US">US</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select status">
              <Option value="Paid">Paid</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Overdue">Overdue</Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
