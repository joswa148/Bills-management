import React, { useState } from 'react';
import { Form, Input, Button, Card, Divider, message, Alert } from 'antd';
import { Lock, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';

/**
 * SecuritySettings
 * Senior Developer pass: Focused security credentials manager with validation.
 */
export default function SecuritySettings() {
  const [form] = Form.useForm();
  const { updateProfile, isLoading } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const onFinish = async (values) => {
    try {
      // Logic for password change: In Node.js, we just PATCH /me with the new password
      await updateProfile({ password: values.newPassword });
      message.success('Password changed successfully 💎');
      setSuccess(true);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update security settings');
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto py-4">
      <div className="mb-10">
        <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Security Credentials</h2>
        <p className="text-sm text-secondary-500 font-medium">Protect your account with a strong, complex password</p>
      </div>

      {success && (
        <Alert 
            type="success"
            showIcon 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            message={<span className="font-bold text-emerald-900">Credentials Updated</span>}
            description={<span className="text-emerald-700">Your password has been changed successfully. Your current session remains active.</span>}
            className="mb-8 rounded-2xl border-emerald-100 bg-emerald-50/50"
            closable
            onClose={() => setSuccess(false)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="premium-form space-y-6"
      >
        <div className="space-y-6">
            <Form.Item
                name="newPassword"
                label={<span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">New Password</span>}
                rules={[
                    { required: true, message: 'Please enter your new password' },
                    { min: 6, message: 'Password must be at least 6 characters long' }
                ]}
            >
                <Input.Password 
                    prefix={<Lock className="w-4 h-4 text-secondary-300 mr-2" />} 
                    placeholder="Enter new password"
                    className="rounded-xl py-2.5 border-secondary-200 hover:border-primary-400 focus:border-primary-500 transition-all shadow-sm"
                />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                label={<span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Confirm New Password</span>}
                dependencies={['newPassword']}
                rules={[
                    { required: true, message: 'Please confirm your new password' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password 
                    prefix={<KeyRound className="w-4 h-4 text-secondary-300 mr-2" />} 
                    placeholder="Confirm new password"
                    className="rounded-xl py-2.5 border-secondary-200 hover:border-primary-400 focus:border-primary-500 transition-all shadow-sm"
                />
            </Form.Item>
        </div>

        <Divider className="my-8 opacity-50" />

        <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl mb-8">
            <div className="flex items-start">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-amber-900 leading-none mb-1.5 pt-1">Security Advisory</h4>
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Changing your password will NOT sign you out of your current device. 
                        We recommend using a unique password not used on other services.
                    </p>
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            className="h-12 px-10 rounded-xl bg-primary-600 font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
          >
            Update Password
          </Button>
        </div>
      </Form>
    </div>
  );
}
