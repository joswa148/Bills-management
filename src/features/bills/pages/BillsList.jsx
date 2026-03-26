import React, { useState } from 'react';
import { Table, Tag, Input, Space, Button, Popconfirm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../../../lib/api/billsApi';
import { Search, Plus, Trash2 } from 'lucide-react';
import BillFormModal from '../components/BillFormModal';
import toast from 'react-hot-toast';

export default function BillsList() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: billsApi.getBills,
  });

  const createMutation = useMutation({
    mutationFn: billsApi.createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill created successfully');
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => billsApi.updateBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill updated successfully');
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: billsApi.deleteBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill deleted successfully');
    }
  });

  const handleModalSubmit = (values) => {
    if (editingBill) {
      updateMutation.mutate({ id: editingBill.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const openAddModal = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const filteredBills = bills?.filter((bill) =>
    bill.productService.toLowerCase().includes(searchText.toLowerCase()) ||
    bill.bank.toLowerCase().includes(searchText.toLowerCase()) ||
    bill.region.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Product/Service',
      dataIndex: 'productService',
      key: 'productService',
      sorter: (a, b) => a.productService.localeCompare(b.productService),
      render: (text) => <span className="font-medium text-gray-900">{text}</span>
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Price (INR)',
      dataIndex: 'priceINR',
      key: 'priceINR',
      render: (val) => `₹${val.toLocaleString()}`
    },
    {
      title: 'Price (AED)',
      dataIndex: 'priceAED',
      key: 'priceAED',
      render: (val) => `${val.toLocaleString()} AED`
    },
    {
      title: 'Total Yearly',
      dataIndex: 'totalYearly',
      key: 'totalYearly',
      render: (val) => `₹${val.toLocaleString()}`
    },
    {
      title: 'Valid Until',
      dataIndex: 'validity',
      key: 'validity',
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => {
        let color = record.status === 'Paid' ? 'green' : 'orange';
        return <Tag color={color} className="rounded-md font-medium px-2 py-0.5">{record.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => openEditModal(record)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer">Edit</a>
          <Popconfirm
            title="Delete the bill"
            description="Are you sure to delete this bill?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <a className="text-red-500 hover:text-red-700 transition-colors cursor-pointer">
              <Trash2 size={16} />
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bills & Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-1">View, search and manage all your recurring and one-time bills.</p>
        </div>
        <Button onClick={openAddModal} type="primary" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 h-10 px-5 rounded-lg font-medium border-0 shadow-sm transition-all">
          <Plus size={18} />
          Add New Bill
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Input
            placeholder="Search bills by product, bank, region..."
            prefix={<Search size={18} className="text-gray-400 mr-2" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-80 h-10 rounded-lg hover:border-blue-400 focus:border-blue-500"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredBills}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, className: 'mt-4' }}
          className="overflow-x-auto border border-gray-50 rounded-lg"
          rowClassName="hover:bg-gray-50/50 transition-colors"
        />
      </div>

      <BillFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingBill}
      />
    </div>
  );
}
