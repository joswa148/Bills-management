import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Plus, Download, Filter } from 'lucide-react';
import { billsApi } from '../../../lib/api/billsApi';
import SubscriptionTable from '../components/SubscriptionTable';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';
import { useSubscriptionStore } from '../../../store/useSubscriptionStore';
import { TableSkeleton } from '../../../components/common/SkeletonLoaders';

export default function SubscriptionsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [viewingSubscription, setViewingSubscription] = useState(null);
  const { fetchSubscriptions, isLoading } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleAdd = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleView = async (subscription) => {
    // 1. Start with the 'lite' data from the list
    setViewingSubscription(subscription);
    setIsViewModalOpen(true);

    // 2. If we have a link to the full bill, fetch it immediately
    if (subscription.latest_invoice_id) {
      try {
        const fullData = await billsApi.getInvoice(subscription.latest_invoice_id);
        const invoice = fullData.invoice || {};
        
        // 3. Senior Developer 'Strong Merge': 
        // We merge them but ONLY overwrite if the new value is NOT empty/null.
        setViewingSubscription(prev => {
          const merged = { ...prev };
          Object.keys(invoice).forEach(key => {
            const val = invoice[key];
            // Only update if the DB has a real value
            if (val !== null && val !== undefined && val !== '') {
              merged[key] = val;
            }
          });
          return merged;
        });
      } catch (err) {
        toast.error('Could not load detailed billing history');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">Subscriptions</h2>
          <p className="text-sm font-medium text-secondary-500 mt-1.5 flex items-center">
            Review and manage all your recurring services.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center justify-center p-3.5 bg-white text-secondary-600 border border-secondary-100 rounded-2xl hover:bg-secondary-50 transition-all duration-300 premium-shadow group">
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <button className="flex items-center justify-center p-3.5 bg-white text-secondary-600 border border-secondary-100 rounded-2xl hover:bg-secondary-50 transition-all duration-300 premium-shadow">
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={handleAdd}
            className="flex items-center justify-center px-6 py-3.5 bg-primary-600 text-white text-sm font-bold rounded-2xl hover:bg-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/25 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Subscription
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto w-full">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <SubscriptionTable onEdit={handleEdit} onView={handleView} />
        )}
      </div>

      <SubscriptionForm 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        initialValues={editingSubscription}
      />

      <SubscriptionDetailModal 
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        subscription={viewingSubscription}
      />
    </div>
  );
}
