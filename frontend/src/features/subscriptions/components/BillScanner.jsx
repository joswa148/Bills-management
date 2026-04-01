import React, { useState } from 'react';
import { Upload, Progress, Button } from 'antd';
import { toast } from 'react-hot-toast';
import { InboxOutlined, LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import axios from '../../../lib/axiosInstance';
import { billsApi } from '../../../lib/api/billsApi';

const { Dragger } = Upload;

export default function BillScanner({ onScanSuccess }) {
  const [loading, setLoading]       = useState(false);
  const [scanning, setScanning]     = useState(false);
  const [success, setSuccess]       = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [confidence, setConfidence] = useState(null); // overallConfidence 0-1
  const [progress, setProgress]     = useState(0);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);
    setSuccess(false);
    setIsDuplicate(false);
    setDuplicateInfo(null);
    setConfidence(null);
    setProgress(10);

    const formData = new FormData();
    formData.append('bill', file);

    try {
      setProgress(30);
      const data = await billsApi.scanBill(formData);

      // ── Duplicate file detected ──────────────────────────────────────────
      if (data.isDuplicate) {
        setIsDuplicate(true);
        setDuplicateInfo(data.duplicateInfo);
        setLoading(false);
        setProgress(0);
        toast('This invoice was already scanned.', { icon: '⚠️' });
        onSuccess('OK');
        return;
      }

      // ── Step 2: Poll async job status ───────────────────────────────────
      setProgress(50);
      setScanning(true);
      
      const jobId = data.jobId;
      let currentProgress = 50;

      const pollStatus = async () => {
        try {
          const res = await billsApi.getScanStatus(jobId);
          if (res.status === 'completed') {
            setProgress(100);
            setScanning(false);
            setSuccess(true);
            setLoading(false);

            if (res.extractedData && res.extractedData._meta) {
              setConfidence(res.extractedData._meta.overallConfidence);
            }

            toast.success('Bill scanned successfully!');
            if (onScanSuccess) {
              const documentUrl = URL.createObjectURL(file);
              onScanSuccess(res.extractedData, documentUrl);
            }
            onSuccess('OK');
          } else if (res.status === 'failed') {
            throw new Error(res.error || 'Scan failed during background processing.');
          } else {
            // Still pending or processing
            currentProgress = Math.min(95, currentProgress + 3);
            setProgress(currentProgress);
            setTimeout(pollStatus, 1500); // Poll every 1.5 seconds
          }
        } catch (error) {
          setLoading(false);
          setScanning(false);
          setProgress(0);
          toast.error(error.message || 'Error checking scan status. Please try again.');
          onError(error);
        }
      };

      // Start polling loop
      setTimeout(pollStatus, 1000);

    } catch (error) {
      setLoading(false);
      setScanning(false);
      setProgress(0);
      toast.error(error.response?.data?.message || 'Failed to scan bill. Check file format.');
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
          ) : isDuplicate ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-4xl">⚠️</span>
              <div className="text-center w-full">
                <p className="text-lg font-bold text-amber-800">Duplicate Bill Detected</p>
                <p className="text-amber-700 text-sm mt-1">
                  This exact file was already scanned on {duplicateInfo?.scannedAt ? new Date(duplicateInfo.scannedAt).toLocaleDateString() : 'a previous date'}.
                </p>
                <div className="mt-3 text-sm bg-white text-left p-3 rounded-lg border border-amber-100 shadow-sm">
                  <p className="mb-1"><span className="font-semibold text-secondary-500">Service:</span> {duplicateInfo?.serviceName}</p>
                  <p className="mb-1"><span className="font-semibold text-secondary-500">Invoice ID:</span> {duplicateInfo?.invoiceIdNumber}</p>
                  <p><span className="font-semibold text-secondary-500">Amount Due:</span> {duplicateInfo?.amountDue}</p>
                </div>
                <Button 
                  onClick={(e) => { e.stopPropagation(); setIsDuplicate(false); setSuccess(false); }} 
                  className="mt-4 bg-white border-amber-300 text-amber-700 font-bold hover:text-amber-800 hover:border-amber-400"
                >
                  Scan a different bill
                </Button>
              </div>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircleFilled style={{ fontSize: 48, color: '#10b981' }} />
              <div className="text-center">
                <p className="text-lg font-bold text-secondary-800">Scan Complete!</p>
                {confidence && (
                  <p className={`text-sm font-semibold mt-1 px-2 py-0.5 rounded-full inline-block ${
                    confidence >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                    confidence >= 0.7 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    AI Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
                <p className="text-secondary-500 text-sm mt-2">Data has been filled in the form below.</p>
                <Button type="link" onClick={(e) => { e.stopPropagation(); setSuccess(false); }} className="p-0 h-auto mt-1">
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
                    const randomInvNum = Math.floor(Math.random() * 90000) + 10000;
                    const today = new Date().toISOString().split('T')[0];
                    const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
                    onScanSuccess({
                      serviceName: 'Harvest Services',
                      category: 'Software',
                      period: 'monthly',
                      invoiceId: `INV-${randomInvNum}`,
                      subject: 'Monthly Web Development & Consulting',
                      senderAddress: 'Harvest Inc.\n123 Creative Way\nSan Francisco, CA 94103\nUSA',
                      clientAddress: 'Joswa Solutions\n456 Tech Park\nBangalore, KA 560001\nIndia',
                      items: [
                        { description: 'Web Development (Senior Developer)', quantity: 40, unitPrice: 25, amount: 1000 },
                        { description: 'Project Management & Consulting', quantity: 5, unitPrice: 50, amount: 250 }
                      ],
                      subtotal: 1250,
                      discount: 312.50,
                      amountDue: 937.50,
                      currency: 'INR',
                      issueDate: today,
                      dueDate: due,
                      poNumber: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
                      paymentMethod: 'Bank Transfer',
                      bankName: 'HDFC Bank',
                      cardLast4: null,
                      region: 'India',
                      status: 'active',
                      notes: 'Thank you for your business. Payment due within 30 days.'
                    });
                    setSuccess(true);
                  }}
                >
                  ⚡ Try Demo Invoice
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
