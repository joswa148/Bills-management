import React, { useState } from 'react';
import { Upload, Progress, Button } from 'antd';
import { toast } from 'react-hot-toast';
import { InboxOutlined, LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import axios from '../../../lib/axiosInstance';
import { billsApi } from '../../../lib/api/billsApi';

const { Dragger } = Upload;

export default function BillScanner({ onScanSuccess }) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    setSuccess(false);
    setProgress(10);

    const formData = new FormData();
    formData.append('bill', file);

    try {
      // Step 1: Uploading
      setProgress(30);
      
      const data = await billsApi.scanBill(formData);

      // Step 2: Scanning Animation
      setProgress(70);
      setScanning(true);
      
      // Artificial delay for the "AI Analysis" animation
      let p = 70;
      const interval = setInterval(() => {
        p += 2;
        setProgress(p);
        if (p >= 95) clearInterval(interval);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setScanning(false);
        setProgress(100);
        setSuccess(true);
        setLoading(false);
        toast.success('Bill scanned successfully!');
        
        if (onScanSuccess) {
          onScanSuccess(data.extractedData);
        }
        onSuccess("OK");
      }, 3000);

    } catch (error) {
      setLoading(false);
      setScanning(false);
      setProgress(0);
      toast.error(error.response?.data?.message || 'Failed to scan bill');
      onError(error);
    }
  };

  return (
    <div className="bill-scanner-container mb-8">
      <Dragger
        customRequest={handleUpload}
        showUploadList={false}
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={loading}
        className={`premium-dragger ${success ? 'success-border' : ''}`}
      >
        <div className="py-6 px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <LoadingOutlined style={{ fontSize: 48, color: '#3b82f6' }} />
                {scanning && <div className="scanner-line"></div>}
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-secondary-800">
                  {scanning ? 'AI Extracting Details...' : 'Uploading Bill...'}
                </p>
                <Progress percent={progress} size="small" strokeColor="#3b82f6" className="w-48" />
              </div>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircleFilled style={{ fontSize: 48, color: '#10b981' }} />
              <div className="text-center">
                <p className="text-lg font-bold text-secondary-800">Scan Complete!</p>
                <p className="text-secondary-500 text-sm">Data has been filled in the form below.</p>
                <Button type="link" onClick={(e) => { e.stopPropagation(); setSuccess(false); }} className="p-0 h-auto">
                  Scan another bill
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2">
                <InboxOutlined style={{ fontSize: 32 }} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-secondary-800">AI Bill Scanner</p>
                <p className="text-secondary-500 text-sm">Drag & drop your bill image or PDF here</p>
                <p className="text-secondary-400 text-xs mt-1">Supports Netflix, AWS, Google, Spotify and more</p>
                <Button 
                  type="link" 
                  size="small" 
                  className="mt-2 text-primary-600 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Manually trigger a mock success with Harvest data for demo
                    onScanSuccess({
                      serviceName: 'Harvest Services',
                      senderAddress: 'Harvest Inc.\n123 Creative Way\nSan Francisco, CA 94103\nUSA',
                      clientAddress: 'Joswa Solutions\n456 Tech Park\nBangalore, KA 560001\nIndia',
                      invoiceId: 'INV-' + Math.floor(Math.random() * 100000),
                      subject: 'Monthly Web Development & Consulting',
                      category: 'Software',
                      items: [
                        { description: 'Web Development (Senior Developer)', quantity: 40, unitPrice: 25, amount: 1000 },
                        { description: 'Project Management & Consulting', quantity: 5, unitPrice: 50, amount: 250 }
                      ],
                      subtotal: 1250,
                      discount: 312.50,
                      amountDue: 937.50,
                      currency: 'INR',
                      poNumber: 'PO-' + Math.floor(Math.random() * 9000),
                      bankName: 'HDFC Bank',
                      paymentMethod: 'Bank Transfer',
                      notes: 'Thank you for your business. Please pay within 30 days.'
                    });
                    setSuccess(true);
                  }}
                >
                  Try Demo Invoice
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dragger>

      <style>{`
        .premium-dragger {
          background: #f8fafc !important;
          border: 2px dashed #e2e8f0 !important;
          border-radius: 1.5rem !important;
          transition: all 0.3s ease !important;
          overflow: hidden;
          position: relative;
        }
        .premium-dragger:hover {
          border-color: #3b82f6 !important;
          background: #f1f5f9 !important;
        }
        .success-border {
          border-color: #10b981 !important;
          background: #f0fdf4 !important;
        }
        .scanner-line {
          position: absolute;
          top: 0;
          left: -10%;
          width: 120%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          box-shadow: 0 0 15px #3b82f6;
          animation: scan 2s ease-in-out infinite;
          z-index: 10;
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .ant-upload-drag:not(.ant-upload-drag-disabled):hover {
          border-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
}
