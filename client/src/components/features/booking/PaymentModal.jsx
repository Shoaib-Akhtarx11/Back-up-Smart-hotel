import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCreditCard, FaUniversity, FaWallet, FaMobileAlt, FaCheck, FaArrowLeft } from 'react-icons/fa';

const PaymentModal = ({ show, onHide, bookingDetails, onConfirm }) => {
  const [step, setStep] = useState('method'); // 'method' -> 'form' -> 'confirm'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    bankName: '',
    accountNumber: '',
    walletEmail: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const pointsToEarn = Math.floor((bookingDetails?.total || 0) / 10);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <FaCreditCard className="fs-3" />,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <FaUniversity className="fs-3" />,
      description: 'Direct bank account transfer'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: <FaWallet className="fs-3" />,
      description: 'Google Pay, Apple Pay, PayPal'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <FaMobileAlt className="fs-3" />,
      description: 'Unified Payments Interface'
    }
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setFormData({
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      bankName: '',
      accountNumber: '',
      walletEmail: '',
      phoneNumber: '',
    });
    setFormErrors({});
    setStep('form');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (selectedMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
        errors.cardNumber = 'Please enter a valid card number';
      }
      if (!formData.cardHolder) {
        errors.cardHolder = 'Please enter cardholder name';
      }
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = 'Please enter expiry date (MM/YY)';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        errors.cvv = 'Please enter a valid CVV';
      }
    } else if (selectedMethod === 'bank') {
      if (!formData.bankName) {
        errors.bankName = 'Please enter your bank name';
      }
      if (!formData.accountNumber || formData.accountNumber.length < 10) {
        errors.accountNumber = 'Please enter a valid account number';
      }
    } else if (selectedMethod === 'wallet') {
      if (!formData.walletEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.walletEmail)) {
        errors.walletEmail = 'Please enter a valid email';
      }
    } else if (selectedMethod === 'upi') {
      if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = () => {
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleConfirmPayment = () => {
    onConfirm();
    setStep('method');
    setSelectedMethod(null);
  };

  const getMethodIcon = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method?.icon;
  };

  const getMethodName = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method?.name;
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      {/* STEP 1: SELECT PAYMENT METHOD */}
      {step === 'method' && (
        <>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">
              <span className="badge bg-primary me-2">Step 1</span>Select Payment Method
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {/* Booking Summary */}
            <div className="bg-light rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Base Amount:</span>
                <span>₹{(bookingDetails?.base || 0).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax (12%):</span>
                <span>₹{(bookingDetails?.tax || 0).toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{(bookingDetails?.total || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <p className="small text-muted mb-3">Choose your preferred payment method:</p>
            <div className="row g-3">
              {paymentMethods.map(method => (
                <div key={method.id} className="col-md-6">
                  <button
                    onClick={() => handleMethodSelect(method.id)}
                    className="w-100 border-2 rounded-3 p-3 text-start transition-all"
                    style={{
                      borderColor: '#e0e0e0',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#007bff';
                      e.currentTarget.style.backgroundColor = '#f8f9ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <div className="text-primary mb-2">{method.icon}</div>
                    <div className="fw-bold text-dark">{method.name}</div>
                    <small className="text-muted">{method.description}</small>
                  </button>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={onHide} className="rounded-pill px-4">
              Cancel
            </Button>
          </Modal.Footer>
        </>
      )}

      {/* STEP 2: ENTER PAYMENT DETAILS */}
      {step === 'form' && (
        <>
          <Modal.Header className="border-0 pb-0">
            <button
              onClick={() => setStep('method')}
              className="btn btn-light rounded-circle p-2"
              style={{ width: '40px', height: '40px' }}
            >
              <FaArrowLeft />
            </button>
            <Modal.Title className="fw-bold ms-2">
              <span className="badge bg-primary me-2">Step 2</span>Payment Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {/* Selected Method Display */}
            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
              <div className="text-primary me-3">{getMethodIcon(selectedMethod)}</div>
              <div>
                <div className="small text-muted">Payment Method</div>
                <div className="fw-bold">{getMethodName(selectedMethod)}</div>
              </div>
            </div>

            {/* CREDIT CARD FORM */}
            {selectedMethod === 'card' && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    maxLength="19"
                    className={`rounded-2 ${formErrors.cardNumber ? 'is-invalid' : ''}`}
                  />
                  {formErrors.cardNumber && <Form.Text className="text-danger">{formErrors.cardNumber}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Cardholder Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    className={`rounded-2 ${formErrors.cardHolder ? 'is-invalid' : ''}`}
                  />
                  {formErrors.cardHolder && <Form.Text className="text-danger">{formErrors.cardHolder}</Form.Text>}
                </Form.Group>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted">Expiry Date</Form.Label>
                      <Form.Control
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength="5"
                        className={`rounded-2 ${formErrors.expiryDate ? 'is-invalid' : ''}`}
                      />
                      {formErrors.expiryDate && <Form.Text className="text-danger">{formErrors.expiryDate}</Form.Text>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted">CVV</Form.Label>
                      <Form.Control
                        type="password"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength="4"
                        className={`rounded-2 ${formErrors.cvv ? 'is-invalid' : ''}`}
                      />
                      {formErrors.cvv && <Form.Text className="text-danger">{formErrors.cvv}</Form.Text>}
                    </Form.Group>
                  </div>
                </div>
              </Form>
            )}

            {/* BANK TRANSFER FORM */}
            {selectedMethod === 'bank' && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="bankName"
                    placeholder="e.g., ICICI Bank, HDFC Bank"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className={`rounded-2 ${formErrors.bankName ? 'is-invalid' : ''}`}
                  />
                  {formErrors.bankName && <Form.Text className="text-danger">{formErrors.bankName}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountNumber"
                    placeholder="1234567890"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className={`rounded-2 ${formErrors.accountNumber ? 'is-invalid' : ''}`}
                  />
                  {formErrors.accountNumber && <Form.Text className="text-danger">{formErrors.accountNumber}</Form.Text>}
                </Form.Group>

                <div className="alert alert-info small mt-3">
                  <strong>Note:</strong> You will be redirected to your bank's website to complete the transfer securely.
                </div>
              </Form>
            )}

            {/* WALLET FORM */}
            {selectedMethod === 'wallet' && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Wallet Email/Account</Form.Label>
                  <Form.Control
                    type="email"
                    name="walletEmail"
                    placeholder="your.email@example.com"
                    value={formData.walletEmail}
                    onChange={handleInputChange}
                    className={`rounded-2 ${formErrors.walletEmail ? 'is-invalid' : ''}`}
                  />
                  {formErrors.walletEmail && <Form.Text className="text-danger">{formErrors.walletEmail}</Form.Text>}
                </Form.Group>

                <div className="alert alert-info small mt-3">
                  <strong>Supported Wallets:</strong> Google Pay, Apple Pay, PayPal, Amazon Pay
                </div>
              </Form>
            )}

            {/* UPI FORM */}
            {selectedMethod === 'upi' && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    placeholder="9876543210"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    maxLength="10"
                    className={`rounded-2 ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                  />
                  {formErrors.phoneNumber && <Form.Text className="text-danger">{formErrors.phoneNumber}</Form.Text>}
                </Form.Group>

                <div className="alert alert-info small mt-3">
                  <strong>Note:</strong> You will receive a payment request on your UPI app.
                </div>
              </Form>
            )}

            {/* Amount Summary */}
            <div className="bg-light rounded-3 p-3 mt-4">
              <div className="d-flex justify-content-between fw-bold">
                <span>Amount to Pay:</span>
                <span className="text-primary">₹{(bookingDetails?.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setStep('method')} className="rounded-pill px-4">
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForm}
              className="rounded-pill px-4 fw-bold"
            >
              Continue to Confirm
            </Button>
          </Modal.Footer>
        </>
      )}

      {/* STEP 3: CONFIRMATION */}
      {step === 'confirm' && (
        <>
          <Modal.Header className="border-0 pb-0">
            <Modal.Title className="fw-bold">
              <span className="badge bg-primary me-2">Step 3</span>Confirm Payment
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {/* Success Icon */}
            <div className="text-center mb-4">
              <div className="bg-light rounded-circle p-4 d-inline-block">
                <FaCheck className="fs-1 text-success" />
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-light rounded-3 p-3 mb-4">
              <h6 className="fw-bold mb-3">Booking Summary</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Base Amount:</span>
                <span>₹{(bookingDetails?.base || 0).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tax (12%):</span>
                <span>₹{(bookingDetails?.tax || 0).toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{(bookingDetails?.total || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4 p-3 border rounded-3">
              <small className="text-muted">Payment Method</small>
              <div className="d-flex align-items-center mt-2">
                <div className="text-primary me-2 fs-5">{getMethodIcon(selectedMethod)}</div>
                <div className="fw-bold">{getMethodName(selectedMethod)}</div>
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="bg-success bg-opacity-10 border border-success rounded-3 p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Loyalty Points</small>
                  <div className="fw-bold text-success">You will earn {pointsToEarn} points</div>
                </div>
                <div className="fs-5">⭐</div>
              </div>
            </div>

            {/* Terms */}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="termsCheck"
                defaultChecked
              />
              <label className="form-check-label small" htmlFor="termsCheck">
                I agree to the terms of service and authorize this payment
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setStep('form')} className="rounded-pill px-4">
              Edit Payment
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmPayment}
              className="rounded-pill px-4 fw-bold"
            >
              <FaCheck className="me-2" />
              Confirm & Pay
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default PaymentModal;