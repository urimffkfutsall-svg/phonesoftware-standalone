import React, { useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Printer, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PSRepairReceipt = ({ repair, onClose }) => {
  const receiptRef = useRef(null);
  
  const getQRUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/#/repair-status/${repair.ticket_number}`;
  };

  const qrUrl = getQRUrl();

  const handlePrint = () => {
    const receiptContent = receiptRef.current.innerHTML;
    
    // Create an invisible iframe for printing - this triggers the print dialog directly
    // without showing a save dialog
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kupon - ${repair.ticket_number}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            background: white;
            width: 100%;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .a4-receipt {
            width: 100%;
            max-width: 180mm;
            margin: 0 auto;
          }
          
          /* === HEADER === */
          .receipt-header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #1a1a1a;
            margin-bottom: 12px;
          }
          .receipt-header h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 2px;
          }
          .receipt-header .subtitle {
            font-size: 10px;
            color: #666;
            letter-spacing: 0.5px;
          }
          .shop-info {
            font-size: 10px;
            color: #444;
            margin-top: 4px;
          }
          
          /* === TICKET BOX === */
          .ticket-box {
            text-align: center;
            border: 2.5px solid #1a1a1a;
            border-radius: 8px;
            padding: 10px 16px;
            margin: 14px auto;
            max-width: 200px;
          }
          .ticket-label {
            font-size: 9px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 600;
          }
          .ticket-number {
            font-size: 24px;
            font-weight: 800;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            margin: 2px 0;
          }
          .ticket-date {
            font-size: 9px;
            color: #666;
          }
          
          /* === RECEIPT TYPE BADGE === */
          .receipt-type {
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            padding: 5px 16px;
            background: #1a1a1a;
            color: white;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 12px 0;
          }
          
          /* === TWO COLUMN LAYOUT === */
          .two-cols {
            display: flex;
            gap: 20px;
            margin: 12px 0;
          }
          .col {
            flex: 1;
          }
          
          /* === SECTIONS === */
          .section {
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #888;
            padding-bottom: 4px;
            border-bottom: 1px solid #ddd;
            margin-bottom: 6px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            padding: 3px 0;
            font-size: 11px;
          }
          .row .label {
            color: #666;
            font-size: 10px;
          }
          .row .value {
            font-weight: 600;
            text-align: right;
            max-width: 60%;
            word-break: break-word;
          }
          
          /* === PROBLEM BOX === */
          .problem-box {
            background: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 8px 10px;
            font-size: 11px;
            line-height: 1.5;
            margin: 6px 0;
          }
          
          /* === ACCESSORIES === */
          .accessories-box {
            background: #fffbe6;
            border: 1px solid #ffe58f;
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 10px;
            margin: 6px 0;
          }
          
          /* === COST BOX === */
          .cost-box {
            border: 2px solid #1a1a1a;
            border-radius: 6px;
            padding: 8px 14px;
            text-align: center;
            margin: 10px 0;
          }
          .cost-amount {
            font-size: 18px;
            font-weight: 800;
          }
          .cost-label {
            font-size: 9px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* === QR SECTION === */
          .qr-section {
            text-align: center;
            padding: 10px;
            border: 1px dashed #ccc;
            border-radius: 6px;
            margin: 10px 0;
          }
          .qr-section svg {
            width: 100px;
            height: 100px;
          }
          .qr-text {
            font-size: 8px;
            color: #999;
            margin-top: 4px;
          }
          
          /* === FOOTER === */
          .receipt-footer {
            text-align: center;
            padding-top: 8px;
            border-top: 1px solid #ddd;
            margin-top: 8px;
          }
          .receipt-footer p {
            font-size: 9px;
            color: #888;
            margin: 2px 0;
          }
          .warranty-badge {
            display: inline-block;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 3px 10px;
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          
          /* === CUT LINE === */
          .cut-line {
            text-align: center;
            padding: 10px 0;
            margin: 16px 0;
            border-top: 2px dashed #999;
            border-bottom: 2px dashed #999;
            font-size: 10px;
            color: #999;
            font-weight: 600;
            letter-spacing: 1px;
            background: #fafafa;
          }
          
          /* === SERVICE COPY HEADER === */
          .service-header {
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 16px;
            background: #333;
            color: white;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
          }
          
          /* === NOTES BOX === */
          .notes-box {
            border: 1.5px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            margin: 10px 0;
          }
          .notes-box .notes-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 6px;
          }
          .notes-line {
            height: 20px;
            border-bottom: 1px dotted #ccc;
          }
          
          /* === SIGNATURE === */
          .signature-section {
            margin-top: 16px;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
          }
          .signature-block {
            flex: 1;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 30px;
            padding-top: 4px;
            font-size: 9px;
            color: #666;
          }
        </style>
      </head>
      <body>
        ${receiptContent}
      </body>
      </html>
    `);
    doc.close();
    
    // Wait for content to render then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove iframe after print
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sq-AL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('sq-AL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!repair || !repair.ticket_number) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="rounded-2xl p-8 text-center" style={{ background: '#151929', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-red-400">Gabim: Nuk ka të dhëna të riparimit</p>
          <Button onClick={onClose} className="mt-4">Mbyll</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="repair-receipt-modal">
      <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: '#151929', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold text-white text-[15px]">Kuponi i Riparimit — A4</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white/40" />
          </button>
        </div>

        {/* Receipt Preview — A4 layout */}
        <div className="flex-1 overflow-auto p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div 
            ref={receiptRef}
            className="bg-white mx-auto shadow-xl rounded-lg"
            style={{ 
              width: '100%',
              maxWidth: '580px',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontSize: '11px',
              lineHeight: '1.4',
              color: '#1a1a1a',
              padding: '24px 30px',
            }}
          >
            <div className="a4-receipt">
              
              {/* ========== KOPJA E KLIENTIT ========== */}
              
              {/* Header */}
              <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid #1a1a1a', marginBottom: '12px' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1px' }}>
                  {repair.shop?.name || 'PhoneSoftware'}
                </div>
                <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.5px' }}>
                  RIPARIME CELULARËSH & AKSESORË
                </div>
                {repair.shop?.address && (
                  <div style={{ fontSize: '10px', color: '#444', marginTop: '3px' }}>
                    {repair.shop.address}{repair.shop?.city ? `, ${repair.shop.city}` : ''}
                    {repair.shop?.phone ? ` • Tel: ${repair.shop.phone}` : ''}
                  </div>
                )}
              </div>

              {/* Receipt Type */}
              <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', padding: '5px 16px', background: '#1a1a1a', color: 'white', textTransform: 'uppercase', letterSpacing: '2px', margin: '12px 0' }}>
                KUPON RIPARIMI — KOPJA E KLIENTIT
              </div>

              {/* Ticket Number */}
              <div style={{ textAlign: 'center', border: '2.5px solid #1a1a1a', borderRadius: '8px', padding: '10px 16px', margin: '14px auto', maxWidth: '220px' }}>
                <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>Nr. Tiketës</div>
                <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: "'Courier New', monospace", letterSpacing: '2px', margin: '2px 0' }}>{repair.ticket_number}</div>
                <div style={{ fontSize: '9px', color: '#666' }}>{formatDate(repair.created_at)}</div>
              </div>

              {/* Two column layout: Customer + Device */}
              <div style={{ display: 'flex', gap: '20px', margin: '12px 0' }}>
                {/* Customer */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', paddingBottom: '4px', borderBottom: '1px solid #ddd', marginBottom: '6px' }}>Klienti</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
                    <span style={{ color: '#666', fontSize: '10px' }}>Emri:</span>
                    <span style={{ fontWeight: '600' }}>{repair.customer_name || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
                    <span style={{ color: '#666', fontSize: '10px' }}>Tel:</span>
                    <span style={{ fontWeight: '600' }}>{repair.customer_phone || '-'}</span>
                  </div>
                </div>
                {/* Device */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', paddingBottom: '4px', borderBottom: '1px solid #ddd', marginBottom: '6px' }}>Pajisja</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
                    <span style={{ color: '#666', fontSize: '10px' }}>Marka:</span>
                    <span style={{ fontWeight: '600' }}>{repair.brand || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
                    <span style={{ color: '#666', fontSize: '10px' }}>Modeli:</span>
                    <span style={{ fontWeight: '600' }}>{repair.model || '-'}</span>
                  </div>
                  {repair.color && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
                      <span style={{ color: '#666', fontSize: '10px' }}>Ngjyra:</span>
                      <span style={{ fontWeight: '600' }}>{repair.color}</span>
                    </div>
                  )}
                  {repair.imei && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
                      <span style={{ color: '#666', fontSize: '10px' }}>IMEI:</span>
                      <span style={{ fontWeight: '600', fontSize: '10px' }}>{repair.imei}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Problem */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', paddingBottom: '4px', borderBottom: '1px solid #ddd', marginBottom: '6px' }}>Problemi / Defekti</div>
                <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '8px 10px', fontSize: '11px', lineHeight: '1.5' }}>
                  {repair.problem_description}
                </div>
              </div>

              {/* Accessories */}
              {repair.accessories_received && repair.accessories_received.length > 0 && (
                <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', padding: '6px 10px', fontSize: '10px', margin: '6px 0' }}>
                  <strong>⚠ Aksesore të lëna:</strong> {repair.accessories_received.join(', ')}
                </div>
              )}

              {/* Cost + QR side by side */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', margin: '12px 0' }}>
                {repair.estimated_cost && (
                  <div style={{ flex: 1, border: '2px solid #1a1a1a', borderRadius: '6px', padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Kosto e Vlerësuar</div>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>{repair.estimated_cost?.toFixed(2)}€</div>
                  </div>
                )}
                <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed #ccc', borderRadius: '6px' }}>
                  <QRCodeSVG 
                    value={qrUrl}
                    size={90}
                    level="M"
                    includeMargin={false}
                  />
                  <div style={{ fontSize: '7px', color: '#999', marginTop: '3px' }}>Skanoni për statusin</div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #ddd', marginTop: '8px' }}>
                {repair.warranty_months > 0 && (
                  <div style={{ display: 'inline-block', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', padding: '3px 10px', fontSize: '10px', fontWeight: '600', marginBottom: '6px' }}>
                    Garancia: {repair.warranty_months} muaj
                  </div>
                )}
                <p style={{ fontSize: '9px', color: '#888', margin: '2px 0' }}>Faleminderit për besimin tuaj!</p>
                <p style={{ fontSize: '8px', color: '#aaa' }}>Ruajeni këtë kupon deri sa të merrni pajisjen</p>
              </div>

              {/* ========== CUT LINE ========== */}
              <div style={{ 
                textAlign: 'center', 
                padding: '10px 0', 
                margin: '20px 0',
                borderTop: '2px dashed #999',
                borderBottom: '2px dashed #999',
                fontSize: '10px',
                color: '#999',
                fontWeight: '600',
                letterSpacing: '1px',
                background: '#fafafa',
              }}>
                ✂ — — — — — — SHKËPUT KËTU — — — — — — ✂
              </div>

              {/* ========== KOPJA E SERVISIT ========== */}
              
              <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', padding: '6px 16px', background: '#333', color: 'white', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                KOPJA E SERVISIT — MBAJ NË DOSJE
              </div>

              {/* Service ticket */}
              <div style={{ textAlign: 'center', border: '2px solid #1a1a1a', borderRadius: '6px', padding: '6px', margin: '8px auto', maxWidth: '180px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: "'Courier New', monospace" }}>{repair.ticket_number}</div>
                <div style={{ fontSize: '9px', color: '#666' }}>{formatDateShort(repair.created_at)}</div>
              </div>

              {/* Service Quick Info */}
              <div style={{ display: 'flex', gap: '20px', margin: '12px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', paddingBottom: '4px', borderBottom: '1px solid #ddd', marginBottom: '6px' }}>Info Klientit</div>
                  {[
                    ['Klienti', repair.customer_name || '-'],
                    ['Tel', repair.customer_phone || '-'],
                  ].map(([label, value], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px', borderBottom: '1px dotted #eee' }}>
                      <strong style={{ fontSize: '10px' }}>{label}:</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', paddingBottom: '4px', borderBottom: '1px solid #ddd', marginBottom: '6px' }}>Pajisja</div>
                  {[
                    ['Pajisja', `${repair.brand || '-'} ${repair.model || ''}`],
                    ...(repair.color ? [['Ngjyra', repair.color]] : []),
                    ...(repair.imei ? [['IMEI', repair.imei]] : []),
                    ...(repair.estimated_cost ? [['Kosto', `${repair.estimated_cost?.toFixed(2)}€`]] : []),
                  ].map(([label, value], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px', borderBottom: '1px dotted #eee' }}>
                      <strong style={{ fontSize: '10px' }}>{label}:</strong>
                      <span style={{ fontSize: label === 'IMEI' ? '9px' : '11px' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problem */}
              <div style={{ fontSize: '10px', padding: '6px 10px', background: '#f5f5f5', borderRadius: '4px', margin: '8px 0', lineHeight: '1.4' }}>
                <strong>Defekti:</strong> {repair.problem_description}
              </div>

              {/* Accessories Warning */}
              {repair.accessories_received && repair.accessories_received.length > 0 && (
                <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', padding: '5px 10px', fontSize: '10px', margin: '6px 0' }}>
                  ⚠ <strong>Aksesore:</strong> {repair.accessories_received.join(', ')}
                </div>
              )}

              {/* Internal Notes Box */}
              <div style={{ border: '1.5px solid #ccc', borderRadius: '4px', padding: '8px', margin: '10px 0' }}>
                <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '6px' }}>Shënime të Brendshme</div>
                <div style={{ height: '20px', borderBottom: '1px dotted #ccc' }}></div>
                <div style={{ height: '20px', borderBottom: '1px dotted #ccc' }}></div>
                <div style={{ height: '20px' }}></div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', marginTop: '16px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #333', marginTop: '30px', paddingTop: '4px', fontSize: '9px', color: '#666' }}>
                    Nënshkrimi i pranimit
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #333', marginTop: '30px', paddingTop: '4px', fontSize: '9px', color: '#666' }}>
                    Nënshkrimi i teknikut
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-11 rounded-xl text-white/60 hover:text-white border-white/10 hover:bg-white/5"
          >
            Mbyll
          </Button>
          <Button 
            onClick={handlePrint} 
            className="flex-1 h-11 rounded-xl border-0 font-semibold"
            style={{ background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)', color: '#0c0f1a' }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Printo Kuponin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PSRepairReceipt;
