import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Avatar } from 'antd';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function SubscriptionTable({ onEdit }) {
  const { subscriptions, deleteSubscription } = useSubscriptionStore();

  const columns = [
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            src={`https://logo.clearbit.com/${(text || '').toLowerCase().replace(/\s+/g, '')}.com`} 
            shape="square" 
            className="border border-secondary-100 bg-white"
          >
            {(text || 'S')[0]}
          </Avatar>
          <div>
            <div className="font-bold text-secondary-900">{text}</div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-secondary-500 uppercase font-medium">{record.category}</span>
              {record.invoiceId && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded inline-block w-fit">
                  {record.invoiceId}
                </span>
              )}
              {record.poNumber && (
                <span className="text-[9px] text-blue-600 font-medium">
                  PO: {record.poNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period) => (
        <Tag color={period.toLowerCase() === 'yearly' ? 'purple' : 'blue'} className="rounded-md px-2 font-medium capitalize">
          {period}
        </Tag>
      ),
    },
    {
      title: 'Price (INR)',
      dataIndex: 'priceINR',
      key: 'priceINR',
      render: (val) => <span className="font-bold text-secondary-900 tabular-nums">₹{Number(val).toLocaleString()}</span>,
    },
    {
      title: 'Price (AED)',
      dataIndex: 'priceAED',
      key: 'priceAED',
      render: (val) => <span className="font-medium text-secondary-500 tabular-nums">{val} AED</span>,
    },
    {
      title: 'Validity',
      dataIndex: 'validityDate',
      key: 'validityDate',
      render: (date) => (
        <div className="text-secondary-600 font-medium">
          {date ? format(parseISO(date), 'MMM dd, yyyy') : 'No Date'}
        </div>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      render: (region) => (
        <Tag color={region === 'India' ? 'orange' : 'cyan'} className="rounded-md border-none px-2 font-medium">
          {region || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const displayStatus = status || 'active';
        const isActive = displayStatus.toLowerCase() === 'active';
        return (
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-emerald-500' : 'bg-secondary-300'}`} />
            <span className={`text-sm font-medium capitalize ${isActive ? 'text-emerald-700' : 'text-secondary-500'}`}>{displayStatus}</span>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<Edit2 size={16} className="text-secondary-400 group-hover:text-primary-600" />} 
              onClick={() => onEdit(record)}
              className="hover:bg-primary-50 rounded-lg flex items-center justify-center transition-all duration-200"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<Trash2 size={16} />} 
              onClick={async () => {
                try {
                  await deleteSubscription(record.id);
                  toast.success('Subscription deleted successfully');
                } catch (err) {
                  toast.error('Failed to delete subscription');
                }
              }}
              className="hover:bg-red-50 rounded-lg flex items-center justify-center transition-all duration-200"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-secondary-100 overflow-hidden premium-shadow">
      <Table 
        columns={columns} 
        dataSource={subscriptions} 
        rowKey="id"
        pagination={{
          pageSize: 10,
          className: "px-6 py-4",
          showTotal: (total) => <span className="text-secondary-500 text-xs font-medium">Total {total} subscriptions</span>
        }}
        className="premium-table"
      />
      
      <style>{`
        .premium-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #f1f5f9;
          padding: 1.25rem 1.5rem;
        }
        .premium-table .ant-table-tbody > tr > td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .premium-table .ant-table-tbody > tr:hover > td {
          background: #f1f5f9/30 !important;
        }
        .premium-table .ant-table-pagination {
          margin-top: 0 !important;
          border-top: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
}
