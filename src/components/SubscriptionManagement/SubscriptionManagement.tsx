'use client';
import { FC, useState } from 'react';
import { MoreHorizontalIcon, AlertTriangleIcon, CreditCardIcon, Tag, Plus, Edit } from 'lucide-react';

// Types
interface Subscription {
  id: string;
  clientName: string;
  plan: string;
  status: 'active' | 'trial' | 'expired' | 'canceled';
  startDate: string;
  endDate?: string;
  amount: number;
  features: string[];
}

interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  dueDate: string;
  attempts?: number;
}

interface Payment {
  id: string;
  clientId: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'credit_card' | 'bank_transfer' | 'paypal';
}

// Subscription Overview Component
interface SubscriptionOverviewProps {
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
}

const SubscriptionOverview: FC<SubscriptionOverviewProps> = ({ subscriptions, invoices, payments }) => {
  const activeCount = subscriptions.filter(sub => sub.status === 'active').length;
  const trialCount = subscriptions.filter(sub => sub.status === 'trial').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const failedPayments = invoices.filter(invoice => invoice.status === 'failed').length;
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subscription Overview</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Active Subscriptions</h3>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Active Trials</h3>
          <p className="text-2xl font-bold text-green-600">{trialCount}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Pending Invoices</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingInvoices}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Payment Failures</h3>
          <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
        </div>
      </div>
    </div>
  );
};

// Subscription List Component
interface SubscriptionListProps {
  subscriptions: Subscription[];
  onAdjust: (subscriptionId: string) => void;
}

const SubscriptionList: FC<SubscriptionListProps> = ({ subscriptions, onAdjust }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Active Subscriptions & Trials</h2>
        <div className="flex gap-2">
          <button className="text-sm text-blue-600">Export</button>
          <button>
            <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscriptions.map(subscription => (
              <tr key={subscription.id}>
                <td className="px-4 py-4 whitespace-nowrap">{subscription.clientName}</td>
                <td className="px-4 py-4 whitespace-nowrap">{subscription.plan}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                    subscription.status === 'canceled' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{subscription.startDate}</td>
                <td className="px-4 py-4 whitespace-nowrap">${subscription.amount.toFixed(2)}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onAdjust(subscription.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Payment Failures Component
interface PaymentFailuresProps {
  failedInvoices: Invoice[];
  onRetry: (invoiceId: string) => void;
}

const PaymentFailures: FC<PaymentFailuresProps> = ({ failedInvoices, onRetry }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold">Payment Failures</h2>
        </div>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      {failedInvoices.length > 0 ? (
        <div className="space-y-4">
          {failedInvoices.map(invoice => (
            <div key={invoice.id} className="border border-red-100 rounded-lg p-4 bg-red-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Invoice #{invoice.id}</p>
                  <p className="text-sm text-gray-500">Due date: {invoice.dueDate}</p>
                  <p className="text-sm text-gray-500">Amount: ${invoice.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Failed attempts: {invoice.attempts || 1}</p>
                </div>
                <button
                  onClick={() => onRetry(invoice.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Retry Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-6 text-gray-500">No failed payments</p>
      )}
    </div>
  );
};

// Manual Adjustment Component
interface ManualAdjustmentProps {
  subscription: Subscription | null;
  onSave: (adjustments: any) => void;
  onCancel: () => void;
}

const ManualAdjustment: FC<ManualAdjustmentProps> = ({ subscription, onSave, onCancel }) => {
  const [discount, setDiscount] = useState(0);
  const [addCredit, setAddCredit] = useState(0);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  
  if (!subscription) return null;
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Manual Adjustment</h2>
        <button onClick={onCancel}>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Client</p>
          <p className="font-medium">{subscription.clientName}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Plan</p>
          <p className="font-medium">{subscription.plan}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Amount</p>
          <p className="font-medium">${subscription.amount.toFixed(2)}</p>
        </div>
        
        <div>
          <label className="block text-sm text-gray-500 mb-1">Apply Discount (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-500 mb-1">Add Credit ($)</label>
          <input
            type="number"
            min="0"
            value={addCredit}
            onChange={(e) => setAddCredit(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="cancel"
            checked={cancelSubscription}
            onChange={() => setCancelSubscription(!cancelSubscription)}
            className="mr-2"
          />
          <label htmlFor="cancel" className="text-red-600">Cancel Subscription</label>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              subscriptionId: subscription.id,
              discount,
              credit: addCredit,
              cancel: cancelSubscription
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Plan Customization Component
interface PlanCustomizationProps {
  onSave: (plan: any) => void;
}

const PlanCustomization: FC<PlanCustomizationProps> = ({ onSave }) => {
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  
  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };
  
  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Plan Customization</h2>
        </div>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Plan Name</label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enterprise, Pro, Custom, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-500 mb-1">Monthly Price ($)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-500 mb-1">Features</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
              placeholder="Add a feature"
            />
            <button
              onClick={addFeature}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2 mt-2">
            {features.map((feature, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span>{feature}</span>
                <button onClick={() => removeFeature(index)} className="text-red-500">
                  Remove
                </button>
              </div>
            ))}
            {features.length === 0 && (
              <p className="text-sm text-gray-500 italic">No features added yet</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={() => onSave({ name: planName, price, features })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!planName || price <= 0 || features.length === 0}
          >
            Create Custom Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Subscription Management Component
interface SubscriptionManagementProps {
  initialData?: {
    subscriptions: Subscription[];
    invoices: Invoice[];
    payments: Payment[];
  };
}

const SubscriptionManagement: FC<SubscriptionManagementProps> = ({ initialData = { 
  subscriptions: [
    {
      id: '1',
      clientName: 'Client A',
      plan: 'Pro',
      status: 'active',
      startDate: '2023-09-01',
      amount: 100,
      features: ['Unlimited users', '24/7 support', 'Advanced analytics'],
    },
    {
      id: '2',
      clientName: 'Client B',
      plan: 'Basic',
      status: 'trial',
      startDate: '2023-10-01',
      amount: 50,
      features: ['Up to 10 users', 'Email support', 'Basic analytics'],
    },
    {
      id: '3',
      clientName: 'Client C',
      plan: 'Enterprise',
      status: 'canceled',
      startDate: '2023-08-01',
      endDate: '2023-09-30',
      amount: 200,
      features: ['Unlimited users', 'Dedicated account manager', 'Custom integrations'],
    },
  ],
  invoices: [
    {
      id: '1',
      clientId: '1',
      amount: 100,
      status: 'paid',
      dueDate: '2023-10-01',
    },
    {
      id: '2',
      clientId: '2',
      amount: 50,
      status: 'failed',
      dueDate: '2023-10-05',
      attempts: 2,
    },
    {
      id: '3',
      clientId: '3',
      amount: 200,
      status: 'pending',
      dueDate: '2023-10-10',
    },
  ],
  payments: [
    {
      id: '1',
      clientId: '1',
      invoiceId: '1',
      amount: 100,
      date: '2023-10-01',
      method: 'credit_card',
    },
    {
      id: '2',
      clientId: '2',
      invoiceId: '2',
      amount: 50,
      date: '2023-10-05',
      method: 'paypal',
    },
  ],
} }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialData.subscriptions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [payments, setPayments] = useState<Payment[]>(initialData.payments);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);
  const [showPlanCustomization, setShowPlanCustomization] = useState(false);
  
  const failedInvoices = invoices.filter(invoice => invoice.status === 'failed');
  
  const handleAdjust = (subscriptionId: string) => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      setSelectedSubscription(subscription);
      setShowManualAdjustment(true);
      setShowPlanCustomization(false);
    }
  };
  
  const handleRetryPayment = (invoiceId: string) => {
    // In a real implementation, this would make an API call
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: 'pending', attempts: (invoice.attempts || 1) + 1 } : invoice
    ));
  };
  
  const handleSaveAdjustment = (adjustments: any) => {
    // In a real implementation, this would make an API call
    if (adjustments.cancel) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === adjustments.subscriptionId ? { ...sub, status: 'canceled', endDate: new Date().toISOString().split('T')[0] } : sub
      ));
    } else {
      const subscription = subscriptions.find(sub => sub.id === adjustments.subscriptionId);
      if (subscription) {
        const discountedAmount = subscription.amount * (1 - adjustments.discount / 100);
        setSubscriptions(subscriptions.map(sub => 
          sub.id === adjustments.subscriptionId ? { ...sub, amount: discountedAmount } : sub
        ));
        
        // If credit was added, you might create a credit record in a real implementation
      }
    }
    
    setShowManualAdjustment(false);
    setSelectedSubscription(null);
  };
  
  const handleSaveCustomPlan = (plan: any) => {
    // In a real implementation, this would make an API call to create a new plan
    console.log('New custom plan created:', plan);
    setShowPlanCustomization(false);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      <SubscriptionOverview 
        subscriptions={subscriptions} 
        invoices={invoices} 
        payments={payments} 
      />
      
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setShowPlanCustomization(true);
            setShowManualAdjustment(false);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Custom Plan
        </button>
      </div>
      
      {showManualAdjustment && (
        <ManualAdjustment 
          subscription={selectedSubscription} 
          onSave={handleSaveAdjustment}
          onCancel={() => {
            setShowManualAdjustment(false);
            setSelectedSubscription(null);
          }}
        />
      )}
      
      {showPlanCustomization && (
        <PlanCustomization onSave={handleSaveCustomPlan} />
      )}
      
      <SubscriptionList 
        subscriptions={subscriptions.filter(sub => ['active', 'trial'].includes(sub.status))} 
        onAdjust={handleAdjust}
      />
      
      {failedInvoices.length > 0 && (
        <PaymentFailures 
          failedInvoices={failedInvoices} 
          onRetry={handleRetryPayment}
        />
      )}
    </div>
  );
};

export default SubscriptionManagement;