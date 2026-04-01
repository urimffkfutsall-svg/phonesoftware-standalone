import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Printer, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PSRepairReceipt = ({ repair, onClose }) => {
  const receiptRef = useRef(null);
  
  // Generate QR URL directly using the ticket number from the repair object
  // This ensures each repair gets its own unique QR code
  const getQRUrl = () => {
    // Use window.location.origin to get the current domain (works after any deployment)
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/repair-status/${repair.ticket_number}`;
  };

  const qrUrl = getQRUrl();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const receiptContent = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kupon - ${repair.ticket_number}</title>
        <style>
          @page {
            size: 80mm 200mm;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            width: 80mm;
            background: white;
            line-height: 1.25;
          }
          .receipt-container {
            width: 80mm;
            padding: 3mm;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 4px;
            margin-bottom: 4px;
          }
          .header h1 {
            font-size: 13px;
            font-weight: bold;
          }
          .header p {
            font-size: 8px;
          }
          .receipt-type {
            text-align: center;
            font-size: 9px;
            font-weight: bold;
            padding: 3px 0;
            background: #000;
            color: #fff;
            margin: 4px 0;
          }
          .ticket-box {
            text-align: center;
            border: 2px solid #000;
            padding: 5px;
            margin: 4px 0;
          }
          .ticket-number {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .section {
            margin: 4px 0;
            padding: 3px 0;
            border-bottom: 1px dashed #ccc;
          }
          .section-title {
            font-weight: bold;
            font-size: 9px;
            background: #f0f0f0;
            padding: 2px 4px;
            margin-bottom: 2px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            margin: 2px 0;
          }
          .row .label { color: #555; }
          .row .value { font-weight: 500; text-align: right; max-width: 55%; }
          .problem-text {
            font-size: 8px;
            line-height: 1.3;
            padding: 3px;
            background: #f9f9f9;
          }
          .qr-section {
            text-align: center;
            padding: 6px 0;
            border: 1px dashed #000;
            margin: 4px 0;
          }
          .qr-section svg {
            width: 90px;
            height: 90px;
          }
          .qr-section p {
            font-size: 7px;
            margin-top: 3px;
          }
          .footer {
            text-align: center;
            font-size: 8px;
            padding-top: 4px;
            border-top: 1px dashed #000;
          }
          .divider {
            text-align: center;
            padding: 5px 0;
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            margin: 5px 0;
            background: #f5f5f5;
            font-size: 9px;
          }
          .cost-box {
            border: 1px solid #000;
            padding: 4px;
            margin: 4px 0;
            text-align: center;
          }
          .cost-row {
            font-size: 11px;
            font-weight: bold;
          }
          .notes-box {
            border: 1px solid #000;
            padding: 4px;
            margin: 4px 0;
          }
          .signature-line {
            margin-top: 8px;
            padding-top: 4px;
            border-top: 1px solid #000;
            font-size: 8px;
            text-align: center;
          }
          @media print {
            body { width: 80mm !important; }
          }
        </style>
      </head>
      <body>
        ${receiptContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sq-AL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sq-AL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // If no repair data, show error
  if (!repair || !repair.ticket_number) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-red-500">Gabim: Nuk ka të dhëna të riparimit</p>
          <Button onClick={onClose} className="mt-4">Mbyll</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="repair-receipt-modal">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Kuponi i Riparimit</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Receipt Preview - 80mm width */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div 
            ref={receiptRef}
            className="bg-white mx-auto shadow-lg"
            style={{ 
              width: '302px',
              fontFamily: "'Courier New', monospace", 
              fontSize: '10px',
              lineHeight: '1.25'
            }}
          >
            <div className="receipt-container" style={{ padding: '10px' }}>
              
              {/* ========== KOPJA E KLIENTIT ========== */}
              <div className="customer-copy">
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {repair.shop?.name || 'PhoneSoftware'}
                  </div>
                  {repair.shop?.address && (
                    <div style={{ fontSize: '9px', color: '#333' }}>{repair.shop.address}, {repair.shop?.city}</div>
                  )}
                  {repair.shop?.phone && (
                    <div style={{ fontSize: '9px', color: '#333' }}>Tel: {repair.shop.phone}</div>
                  )}
                </div>

                {/* Receipt Type */}
                <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', padding: '3px 0', background: '#000', color: '#fff', margin: '5px 0' }}>
                  KUPON RIPARIMI - KLIENTI
                </div>

                {/* Ticket Number */}
                <div style={{ textAlign: 'center', border: '2px solid #000', padding: '6px', margin: '5px 0' }}>
                  <div style={{ fontSize: '8px', color: '#666' }}>Nr. Tiketës</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>{repair.ticket_number}</div>
                  <div style={{ fontSize: '8px', marginTop: '2px' }}>{formatDate(repair.created_at)}</div>
                </div>

                {/* Customer Info */}
                <div style={{ margin: '5px 0', padding: '4px 0', borderBottom: '1px dashed #ccc' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9px', background: '#f0f0f0', padding: '2px 4px', marginBottom: '3px' }}>KLIENTI</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', margin: '2px 0' }}>
                    <span style={{ color: '#555' }}>Emri:</span>
                    <span style={{ fontWeight: '500' }}>{repair.customer_name || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', margin: '2px 0' }}>
                    <span style={{ color: '#555' }}>Tel:</span>
                    <span style={{ fontWeight: '500' }}>{repair.customer_phone || '-'}</span>
                  </div>
                </div>

                {/* Device Info */}
                <div style={{ margin: '5px 0', padding: '4px 0', borderBottom: '1px dashed #ccc' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9px', background: '#f0f0f0', padding: '2px 4px', marginBottom: '3px' }}>PAJISJA</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', margin: '2px 0' }}>
                    <span style={{ color: '#555' }}>Marka:</span>
                    <span style={{ fontWeight: '500' }}>{repair.brand || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', margin: '2px 0' }}>
                    <span style={{ color: '#555' }}>Modeli:</span>
                    <span style={{ fontWeight: '500' }}>{repair.model || '-'}</span>
                  </div>
                  {repair.color && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', margin: '2px 0' }}>
                      <span style={{ color: '#555' }}>Ngjyra:</span>
                      <span style={{ fontWeight: '500' }}>{repair.color}</span>
                    </div>
                  )}
                  {repair.imei && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', margin: '2px 0' }}>
                      <span style={{ color: '#555' }}>IMEI:</span>
                      <span style={{ fontWeight: '500', fontSize: '8px' }}>{repair.imei}</span>
                    </div>
                  )}
                </div>

                {/* Problem */}
                <div style={{ margin: '5px 0', padding: '4px 0', borderBottom: '1px dashed #ccc' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9px', background: '#f0f0f0', padding: '2px 4px', marginBottom: '3px' }}>PROBLEMI</div>
                  <div style={{ fontSize: '8px', lineHeight: '1.3', padding: '3px', background: '#f9f9f9' }}>
                    {repair.problem_description}
                  </div>
                </div>

                {/* Accessories */}
                {repair.accessories_received && repair.accessories_received.length > 0 && (
                  <div style={{ fontSize: '8px', padding: '3px', background: '#fff3cd', margin: '4px 0' }}>
                    <strong>Aksesore:</strong> {repair.accessories_received.join(', ')}
                  </div>
                )}

                {/* Cost */}
                {repair.estimated_cost && (
                  <div style={{ border: '1px solid #000', padding: '5px', margin: '5px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                      Kosto e Vlerësuar: {repair.estimated_cost?.toFixed(2)}€
                    </div>
                  </div>
                )}

                {/* QR Code - Generated directly in frontend */}
                <div style={{ textAlign: 'center', padding: '8px', border: '1px dashed #000', margin: '5px 0' }}>
                  <QRCodeSVG 
                    value={qrUrl}
                    size={90}
                    level="M"
                    includeMargin={false}
                  />
                  <div style={{ fontSize: '7px', color: '#666', marginTop: '3px' }}>
                    Skanoni për statusin
                  </div>
                  <div style={{ fontSize: '6px', color: '#999', marginTop: '1px' }}>
                    {repair.ticket_number}
                  </div>
                </div>

                {/* Warranty + Footer */}
                <div style={{ textAlign: 'center', fontSize: '8px', paddingTop: '4px', borderTop: '1px dashed #000' }}>
                  {repair.warranty_months > 0 && <div>Garancia: <strong>{repair.warranty_months} muaj</strong></div>}
                  <div style={{ marginTop: '3px', color: '#666' }}>Faleminderit për besimin!</div>
                  <div style={{ fontSize: '7px', color: '#999' }}>Ruajeni kuponin deri në marrje</div>
                </div>
              </div>

              {/* ========== CUT LINE ========== */}
              <div style={{ 
                textAlign: 'center', 
                padding: '6px 0', 
                borderTop: '2px dashed #000',
                borderBottom: '2px dashed #000',
                margin: '8px 0',
                background: '#f5f5f5',
                fontSize: '9px'
              }}>
                ✂ - - - - - - - SHKËPUT KËTU - - - - - - - ✂
              </div>

              {/* ========== KOPJA E SERVISIT ========== */}
              <div className="service-copy">
                {/* Header */}
                <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', padding: '3px 0', background: '#333', color: '#fff', marginBottom: '5px' }}>
                  KOPJA E SERVISIT - MBAJ NË DOSJE
                </div>

                {/* Ticket */}
                <div style={{ textAlign: 'center', border: '2px solid #000', padding: '5px', margin: '5px 0' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{repair.ticket_number}</div>
                  <div style={{ fontSize: '8px' }}>{formatDateShort(repair.created_at)}</div>
                </div>

                {/* Quick Info */}
                <div style={{ fontSize: '9px', lineHeight: '1.4', margin: '5px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #ccc' }}>
                    <strong>Klienti:</strong>
                    <span>{repair.customer_name || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #ccc' }}>
                    <strong>Tel:</strong>
                    <span>{repair.customer_phone || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #ccc' }}>
                    <strong>Pajisja:</strong>
                    <span>{repair.brand} {repair.model}</span>
                  </div>
                  {repair.color && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #ccc' }}>
                      <strong>Ngjyra:</strong>
                      <span>{repair.color}</span>
                    </div>
                  )}
                  {repair.imei && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #ccc' }}>
                      <strong>IMEI:</strong>
                      <span style={{ fontSize: '8px' }}>{repair.imei}</span>
                    </div>
                  )}
                  {repair.estimated_cost && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: 'bold' }}>
                      <span>Kosto:</span>
                      <span>{repair.estimated_cost?.toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                {/* Problem */}
                <div style={{ fontSize: '8px', padding: '4px', background: '#f5f5f5', margin: '5px 0', lineHeight: '1.3' }}>
                  <strong>Defekti:</strong> {repair.problem_description}
                </div>

                {/* Accessories Warning */}
                {repair.accessories_received && repair.accessories_received.length > 0 && (
                  <div style={{ fontSize: '8px', padding: '3px', background: '#fff3cd', margin: '4px 0' }}>
                    ⚠ <strong>Aksesore:</strong> {repair.accessories_received.join(', ')}
                  </div>
                )}

                {/* Notes Box */}
                <div style={{ border: '1px solid #000', padding: '4px', margin: '5px 0' }}>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>SHËNIME TË BRENDSHME:</div>
                  <div style={{ height: '30px', borderBottom: '1px dotted #ccc' }}></div>
                  <div style={{ height: '25px' }}></div>
                </div>

                {/* Signature */}
                <div style={{ marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #000', fontSize: '8px', textAlign: 'center' }}>
                  Nënshkrimi i pranimit: _______________________
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Mbyll
          </Button>
          <Button onClick={handlePrint} className="flex-1 bg-[#00a79d] hover:bg-[#008f86]">
            <Printer className="h-4 w-4 mr-2" />
            Printo Kuponin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PSRepairReceipt;
