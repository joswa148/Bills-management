import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, UserAddOutlined, MailOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import axios from '../../../lib/axiosInstance';

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/register', values);
      const { user, token } = response.data.data;
      setAuth(user, token);
      message.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <Card 
        className="w-full max-w-[440px] border-none shadow-2xl rounded-[32px] overflow-hidden"
        bodyStyle={{ padding: '48px 40px' }}
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
            <UserAddOutlined className="text-white text-2xl" />
          </div>
          <Title level={2} className="!mb-2 font-bold tracking-tight">Create Account</Title>
          <Text className="text-secondary-500 font-medium">Join us to manage your bills effortlessly</Text>
        </div>

        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
          className="premium-form"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-secondary-400 mr-2" />} 
              placeholder="Full name" 
              className="rounded-2xl py-3 border-secondary-200 hover:border-primary-400 focus:border-primary-500 transition-all shadow-sm"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-secondary-400 mr-2" />} 
              placeholder="Email address" 
              className="rounded-2xl py-3 border-secondary-200 hover:border-primary-400 focus:border-primary-500 transition-all shadow-sm"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-secondary-400 mr-2" />} 
              placeholder="Password"
              className="rounded-2xl py-3 border-secondary-200 hover:border-primary-400 focus:border-primary-500 transition-all shadow-sm"
            />
          </Form.Item>

          <Form.Item className="mb-8 mt-10">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              className="h-14 rounded-2xl bg-primary-600 font-bold text-[16px] shadow-lg shadow-primary-500/25 hover:bg-primary-700 active:scale-[0.98] transition-all"
            >
              Sign Up
            </Button>
          </Form.Item>

          <Divider plain className="text-secondary-400 font-medium text-xs mb-8">OR CONTINUE WITH</Divider>

          <Space className="w-full justify-center gap-4 mb-8">
            <Button className="h-12 w-16 flex items-center justify-center rounded-xl border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
              <GoogleOutlined className="text-lg" />
            </Button>
            <Button className="h-12 w-16 flex items-center justify-center rounded-xl border-secondary-200 hover:border-secondary-900 hover:bg-secondary-50 transition-all">
              <GithubOutlined className="text-lg" />
            </Button>
          </Space>

          <div className="text-center">
            <Text className="text-secondary-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700">
                Sign in
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
