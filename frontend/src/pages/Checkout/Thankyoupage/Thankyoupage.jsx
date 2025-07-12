import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../../../components/userHeader';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import './Thankyoupage.css';

const Thankyoupage = () => {
    const navigate = useNavigate();

    return (
        <div className="thankyou-page">
            <Header />
            <motion.div 
                className="thankyou-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="check-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <CheckCircle size={64} className="text-green-500" />
                </motion.div>
                
                <motion.h1 
                    className="title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Thank You for Your Purchase!
                </motion.h1>
                
                <motion.p 
                    className="message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Your order has been successfully placed. You can track your order in the orders section.
                </motion.p>
                
                <div className="buttons">
                    <Button 
                        onClick={() => navigate('/orders')}
                        className="view-orders-btn"
                    >
                        View Orders
                    </Button>
                    
                    <Button 
                        onClick={() => navigate('/products')}
                        variant="outline"
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default Thankyoupage;