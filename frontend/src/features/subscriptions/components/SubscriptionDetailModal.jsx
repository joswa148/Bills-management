import React from 'react';
import { Modal, Descriptions, Tag, Divider, Table, Avatar, Row, Col } from 'antd';
import { Calendar, Receipt, User, Building, MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * SubscriptionDetailModal
 * High-fidelity 'Senior Developer' view for subscription metadata.
 */
export default function SubscriptionDetailModal({ open, onCancel, subscription }) {
  if (!subscription) return null;

  const {
    // Check both camelCase (OCR result) and snake_case (DB result)
    serviceName: sName, service_name,
    category: cat, status: stat, period: per, region: reg,
    senderAddress: sAddr, sender_address,
    clientAddress: cAddr, client_address,
    invoiceId: invId, invoiceIdNumber: invIdNum, invoice_id_number,
    poNumber: poNum, po_number,
    issueDate: iDate, issue_date,
    dueDate: dDate, due_date,
    subject: subj,
    subtotal: sub, discount: disc, amountDue: amtDue, amount_due, price_inr, currency: curr,
    paymentMethod: pMethod, payment_method,
    bankName: bName, bank_name,
    cardLast4: c4, card_last4,
    notes, items = []
  } = subscription;

  // 1. Senior Developer Helper: Find the first non-empty string in the property chain
  const firstValid = (...args) => args.find(a => a !== null && a !== undefined && String(a).trim() !== '');

  const serviceName   = firstValid(sName, service_name, 'Service Record');
  const category      = firstValid(cat, 'General');
  const status        = firstValid(stat, 'active');
  const period        = per  || 'monthly';
  const region        = reg  || 'India';
  const senderAddress = firstValid(sAddr, sender_address, '');
  const clientAddress = firstValid(cAddr, client_address, '');
  const invoiceId     = firstValid(invId, invIdNum, invoice_id_number, subscription.invoice_id, 'N/A');
  const poNumber      = firstValid(poNum, po_number, 'N/A');
  const issueDate     = iDate || issue_date || null;
  const dueDate       = dDate || due_date || null;
  const amountDue     = amtDue || amount_due || price_inr || 0;
  const subtotal      = sub || amountDue || 0;
  const discount      = disc || 0;
  const currency      = curr || 'INR';
  const subject       = firstValid(subj, `Invoice for ${serviceName}`);
  const paymentMethod = firstValid(pMethod, payment_method, 'BANK');
  const bankName      = firstValid(bName, bank_name, 'General Account');
  const cardLast4     = c4 || card_last4;

  const itemColumns = [
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center', width: 60 },
    { title: 'Price', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right', 
      render: (val, record) => {
        const price = val || record.unit_price || 0;
        return `${currency} ${Number(price).toLocaleString()}`;
      }
    },
    { title: 'Total', dataIndex: 'amount', key: 'amount', align: 'right',
      render: (val) => `${currency} ${Number(val).toLocaleString()}` },
  ];

  const StatIcon = ({ icon: Icon, color = "text-secondary-400" }) => (
    <Icon className={`w-4 h-4 mr-2 ${color}`} />
  );

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={850}
      className="premium-modal no-scrollbar"
      style={{ top: 20 }}
      centered
    >
      <div className="p-2">
        {/* ─── Header Section ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar 
                src={`https://logo.clearbit.com/${(serviceName || '').toLowerCase().replace(/\s+/g, '')}.com`} 
                size={64}
                shape="square" 
                className="border border-secondary-100 bg-white shadow-sm"
              >
                {(serviceName || 'S')[0]}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 leading-tight">{serviceName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Tag color="blue" className="rounded-full px-3 border-none bg-blue-50 text-blue-600 font-semibold">{category || 'General'}</Tag>
                <span className="text-secondary-400 text-xs">•</span>
                <span className="text-secondary-500 text-sm font-medium capitalize">{period} Billing</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Tag color={status?.toLowerCase() === 'active' ? 'success' : 'default'} className="rounded-full px-4 border-none py-0.5 font-bold uppercase tracking-wider text-[10px]">
              {status}
            </Tag>
            <div className="text-secondary-400 text-[10px] mt-2 font-medium tracking-tight uppercase">Processed 5 mins ago</div>
          </div>
        </div>

        <Divider className="my-6" />

        {/* ─── Information Grid ──────────────────────────────────────── */}
        <Row gutter={[32, 32]}>
          <Col span={12}>
            <h3 className="flex items-center text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">
              <StatIcon icon={Building} /> Sender Details
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-secondary-50 min-h-[100px] text-sm text-secondary-700 leading-relaxed whitespace-pre-wrap">
              {senderAddress || 'No sender address provided'}
            </div>
          </Col>
          <Col span={12}>
            <h3 className="flex items-center text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">
              <StatIcon icon={User} /> Client Details
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-secondary-50 min-h-[100px] text-sm text-secondary-700 leading-relaxed whitespace-pre-wrap">
              {clientAddress || 'No client address provided'}
            </div>
          </Col>
        </Row>

        <Row gutter={[32, 24]} className="mt-8">
          <Col span={8}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Invoice ID</span>
              <span className="text-sm font-bold text-secondary-800">{invoiceId || 'N/A'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">Issue Date</span>
              <span className="text-sm font-bold text-secondary-800">{issueDate ? dayjs(issueDate).format('MMMM DD, YYYY') : 'N/A'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">PO Number</span>
              <span className="text-sm font-bold text-secondary-800">{poNumber || 'N/A'}</span>
            </div>
          </Col>
        </Row>

        {/* ─── Line Items ─────────────────────────────────────────── */}
        <div className="mt-10">
          <h3 className="flex items-center text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">
            <StatIcon icon={Receipt} /> Itemized Breakdown
          </h3>
          <Table 
            dataSource={items} 
            columns={itemColumns} 
            pagination={false} 
            size="small"
            className="premium-detail-table border border-secondary-100 rounded-xl overflow-hidden"
            rowKey={(r, i) => i}
          />
        </div>

        {/* ─── Financial & Notes ──────────────────────────────────── */}
        <div className="mt-10 flex justify-between items-start">
          <div className="w-1/2 pr-8">
            <h3 className="flex items-center text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">
              <StatIcon icon={Banknote} /> Notes & Payment
            </h3>
            <div className="space-y-4">
              {notes && <p className="text-xs text-secondary-500 italic leading-relaxed">"{notes}"</p>}
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-white border border-secondary-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <CreditCard size={14} className="text-secondary-600" />
                    </div>
                    <div>
                        <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-tight">{paymentMethod || 'BANK'}</div>
                        <div className="text-xs font-bold text-secondary-800">{bankName || 'General Account'}</div>
                    </div>
                </div>
                {cardLast4 && <span className="text-xs font-mono text-secondary-400 bg-white px-2 py-1 rounded border border-secondary-100">**** {cardLast4}</span>}
              </div>
            </div>
          </div>

          <div className="w-80 bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Subtotal</span>
                    <span className="font-bold text-sm">{currency} {Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest">Discount</span>
                    <span className="font-bold text-sm">- {currency} {Number(discount).toLocaleString()}</span>
                </div>
                <Divider className="border-slate-700 my-4" />
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Final Amount Due</div>
                        <div className="flex items-baseline">
                            <span className="text-xl font-black text-white mr-1">{currency}</span>
                            <span className="text-3xl font-black text-white leading-none">{Number(amountDue).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .premium-detail-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          font-size: 10px !important;
          color: #64748b !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }
        .premium-detail-table .ant-table-tbody > tr > td {
          font-size: 12px !important;
          padding: 12px 16px !important;
        }
      `}</style>
    </Modal>
  );
}
