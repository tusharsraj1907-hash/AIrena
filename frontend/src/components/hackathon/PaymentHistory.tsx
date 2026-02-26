import React, { useState, useEffect } from 'react';
import { ReceiptText, Download, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export const PaymentHistory: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownloadReceipt = async (payment: any) => {
        if (payment.status !== 'SUCCESS') {
            toast.error('Receipt is only available for successful payments');
            return;
        }
        try {
            setDownloadingId(payment.id);
            const hackathonName = (payment.hackathon?.title || 'receipt').replace(/\s+/g, '-').toLowerCase();
            await api.downloadReceipt(payment.id, `receipt-${hackathonName}-${payment.invoiceId}.pdf`);
            toast.success('Receipt downloaded!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to download receipt');
        } finally {
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const data = await api.getPaymentHistory();
            setPayments(data);
        } catch (error: any) {
            console.error('Error fetching payment history:', error);
            toast.error(error.message || 'Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Payment History</h2>
                    <p className="text-white/70 mt-2 text-sm">Track all your hackathon related payments and receipts</p>
                </div>
            </div>

            {payments.length === 0 ? (
                <Card className="p-12 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm text-center">
                    <ReceiptText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Payments Found</h3>
                    <p className="text-white/70">Your payment details will appear here once you make a transaction</p>
                </Card>
            ) : (
                <Card className="bg-slate-900/50 border-slate-700 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="px-6 py-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Invoice ID</th>
                                    <th className="px-6 py-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Hackathon</th>
                                    <th className="px-6 py-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-slate-300 font-semibold text-xs uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-blue-400">{payment.invoiceId || 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold text-white text-sm">
                                            {payment.hackathon?.title || 'Registration Fee'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white text-sm">
                                            {payment.currency} {payment.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                payment.status === 'SUCCESS'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : payment.status === 'FAILED'
                                                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                            }>
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                                onClick={() => handleDownloadReceipt(payment)}
                                                disabled={payment.status !== 'SUCCESS' || downloadingId === payment.id}
                                            >
                                                {downloadingId === payment.id ? (
                                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                ) : (
                                                    <Download className="w-3 h-3 mr-2" />
                                                )}
                                                Receipt
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
