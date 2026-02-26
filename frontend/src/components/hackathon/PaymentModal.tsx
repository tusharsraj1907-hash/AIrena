import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    X,
    Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paymentDetails: { paymentId: string; providerPaymentId: string }) => void;
    hackathonTitle: string;
    amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    hackathonTitle,
    amount
}) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'details' | 'success'>('details');
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Use 'test_' prefix so backend recognizes this as a test payment and skips verification
            const mockPaymentId = `test_payment_${Math.random().toString(36).substring(7)}`;
            const mockProviderPaymentId = `test_provider_${Math.random().toString(36).substring(7)}`;

            setStep('success');
            setTimeout(() => {
                onSuccess({
                    paymentId: mockPaymentId,
                    providerPaymentId: mockProviderPaymentId
                });
            }, 1500);

        } catch (error) {
            toast.error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    console.log('💰 PaymentModal: Rendering with amount:', amount, 'in Portal');

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 99999 }} // Force z-index
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {step === 'details' ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-6"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Payment Secure</h2>
                                    <p className="text-slate-400 text-sm mt-1">Hackathon Creation Fee</p>
                                </div>
                                {!loading && (
                                    <button
                                        onClick={onClose}
                                        className="p-1 hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-300 text-xs uppercase tracking-wider font-semibold">Hackathon</span>
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                                        ONE-TIME FEE
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-white font-semibold truncate mr-4">{hackathonTitle}</span>
                                    <span className="text-2xl font-bold text-white whitespace-nowrap">₹{amount}</span>
                                </div>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Cardholder Name</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Full Name"
                                            className="bg-slate-800/50 border-slate-700 text-white pl-10 h-11"
                                            required
                                            value={cardData.name}
                                            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Card Number</Label>
                                    <Input
                                        placeholder="4444 4444 4444 4444"
                                        className="bg-slate-800/50 border-slate-700 text-white h-11"
                                        required
                                        value={cardData.number}
                                        onChange={(e) => {
                                            // Simple formatting
                                            const val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                            if (val.length <= 19) setCardData({ ...cardData, number: val });
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Expiry</Label>
                                        <Input
                                            placeholder="MM/YY"
                                            className="bg-slate-800/50 border-slate-700 text-white h-11"
                                            required
                                            value={cardData.expiry}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\//g, '');
                                                if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                if (val.length <= 5) setCardData({ ...cardData, expiry: val });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">CVV</Label>
                                        <Input
                                            placeholder="***"
                                            type="password"
                                            className="bg-slate-800/50 border-slate-700 text-white h-11"
                                            required
                                            maxLength={3}
                                            value={cardData.cvv}
                                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-500 py-2 border-t border-slate-800 mt-2">
                                    <Shield className="w-3 h-3 text-green-500" />
                                    <span>Secure 256-bit SSL encrypted payment</span>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base transition-all active:scale-95"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        `Pay ₹${amount}`
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Verified</h2>
                            <p className="text-slate-300">Transaction successful. Creating your hackathon...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>,
        document.body
    );
};
