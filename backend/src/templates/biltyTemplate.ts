import path from 'path';

export const generateBiltyHtml = (data: any) => {
  const {
    biltyNo,
    date,
    truckNo,
    driverNo,
    cnic,
    origin,
    destination,
    sender,
    receiver,
    quantity,
    description,
    totalFare,
    advance,
    balance,
    financialNotes,
    containerNo,
    shippingLine
  } = data;

  const publicPath = path.join(process.cwd(), 'public');
  const logoPath = `file://${path.join(publicPath, 'mlcs_logo.png').replace(/\\/g, '/')}`;
  const truckPath = `file://${path.join(publicPath, 'truck.png').replace(/\\/g, '/')}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bilty ${biltyNo}</title>
    <style>
        /* Removed external font import to prevent hanging */
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #2d3e50;
        }

        .page {
            width: 297mm;
            height: 210mm;
            padding: 0;
            margin: 0;
            position: relative;
            background: white;
            overflow: hidden;
        }

        /* HEADER DESIGN */
        .header-strip {
            background: #2d3e50;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .header-body {
            display: flex;
            align-items: center;
            padding: 25px 50px;
            position: relative;
        }

        .logo-container {
            width: 90px;
            height: 90px;
            border: 4px solid #4caf50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            z-index: 2;
        }

        .logo-img {
            width: 70%;
            height: auto;
        }

        .company-branding {
            margin-left: 30px;
            z-index: 2;
        }

        .company-name {
            font-size: 42px;
            font-weight: 800;
            color: #2d3e50;
            line-height: 1;
            margin-bottom: 5px;
        }

        .company-meta {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
        }

        .truck-illustration {
            position: absolute;
            right: 50px;
            top: 20px;
            width: 200px;
            opacity: 0.8;
        }

        /* GRID SECTION */
        .main-content {
            padding: 0 50px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .info-label {
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
        }

        .info-value {
            font-size: 16px;
            font-weight: 600;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
            min-height: 24px;
        }

        .bilty-no {
            color: #dc2626;
            font-size: 20px;
            font-weight: 800;
        }

        /* TABLE SECTION */
        .bilty-table {
            width: 100%;
            border: 2px solid #2d3e50;
            border-radius: 8px;
            border-collapse: collapse;
            overflow: hidden;
        }

        .table-head {
            background: #2d3e50;
            color: white;
        }

        .table-head th {
            padding: 12px;
            text-align: center;
            font-size: 12px;
            text-transform: uppercase;
            border-right: 1px solid rgba(255,255,255,0.1);
        }

        .table-row {
            height: 300px;
            vertical-align: top;
        }

        .table-row td {
            border-right: 2px solid #2d3e50;
            padding: 15px;
        }

        .fin-cell {
            padding: 0 !important;
            border-right: none !important;
        }

        .financials {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .fin-notes {
            flex: 1;
            padding: 10px;
            font-size: 14px;
        }

        .fin-row {
            display: flex;
            border-top: 2px solid #2d3e50;
        }

        .fin-label {
            flex: 1;
            padding: 10px;
            background: #f8fafc;
            font-weight: 700;
            text-align: right;
            border-right: 2px solid #2d3e50;
        }

        .fin-val {
            width: 100px;
            padding: 10px;
            text-align: center;
            font-weight: 800;
        }

        .balance-box {
            background: #2d3e50;
            color: white;
        }

        .balance-box .fin-label {
            background: transparent;
            border-right: 1px solid rgba(255,255,255,0.2);
        }

        /* FOOTER */
        .page-footer {
            margin-top: 30px;
        }

        .sig-row {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 0 20px;
        }

        .sig-line {
            width: 200px;
            border-bottom: 2px solid #2d3e50;
            margin-bottom: 5px;
        }

        .sig-text {
            font-size: 11px;
            font-weight: 700;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header-strip">
            Head Office: Nag Shah Chowk, Muzaffargarh Road near NHA Office Multan
        </div>

        <div class="header-body">
            <div class="logo-container">
                <img src="${logoPath}" class="logo-img" alt="Logo">
            </div>
            <div class="company-branding">
                <div class="company-name">Madad Logistic container services</div>
                <div class="company-meta">
                    NTN # 727312-4  |  Contact: 0300-8632436, 0300-8633436, 0301-2066565
                </div>
            </div>
            <img src="${truckPath}" class="truck-illustration" alt="Truck">
        </div>

        <div class="main-content">
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Bilty No</span>
                    <span class="info-value bilty-no">${biltyNo}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date</span>
                    <span class="info-value">${date}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Truck No</span>
                    <span class="info-value">${truckNo || ''}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Driver No</span>
                    <span class="info-value">${driverNo || ''}</span>
                </div>
                
                <div class="info-item" style="grid-column: span 2">
                    <span class="info-label">CNIC / Container No</span>
                    <span class="info-value" style="letter-spacing: 2px">${Array.isArray(cnic) ? cnic.join('') : (cnic || '')}</span>
                </div>
                <div class="info-item" style="grid-column: span 2">
                    <span class="info-label">Shipping Line</span>
                    <span class="info-value">${shippingLine || ''}</span>
                </div>

                <div class="info-item" style="grid-column: span 2">
                    <span class="info-label">Origin</span>
                    <span class="info-value">${origin || ''}</span>
                </div>
                <div class="info-item" style="grid-column: span 2">
                    <span class="info-label">Destination</span>
                    <span class="info-value">${destination || ''}</span>
                </div>

                <div class="info-item" style="grid-column: span 2">
                    <span class="info-label">Sender</span>
                    <span class="info-value">${sender || ''}</span>
                </div>
                <div class="info-item" style="grid-column: span 2">
                    <span class="info-label">Receiver</span>
                    <span class="info-value">${receiver || ''}</span>
                </div>
            </div>

            <table class="bilty-table">
                <thead class="table-head">
                    <tr>
                        <th style="width: 15%">Quantity</th>
                        <th style="width: 45%">Description / Goods Details</th>
                        <th style="width: 40%">Financial Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table-row">
                        <td style="text-align: center; font-weight: 700; font-size: 20px">${quantity || ''}</td>
                        <td>${description || ''}</td>
                        <td class="fin-cell">
                            <div class="financials">
                                <div class="fin-notes">${financialNotes || ''}</div>
                                <div class="fin-row">
                                    <div class="fin-label">Total Fare</div>
                                    <div class="fin-val">${totalFare || '0'}</div>
                                </div>
                                <div class="fin-row">
                                    <div class="fin-label">Advance</div>
                                    <div class="fin-val">${advance || '0'}</div>
                                </div>
                                <div class="fin-row balance-box">
                                    <div class="fin-label">BALANCE</div>
                                    <div class="fin-val" style="font-size: 20px">${balance || '0'}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="page-footer">
                <div class="sig-row">
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-text">SENDER SIGNATURE</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-text">RECEIVER SIGNATURE</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-text">AUTHORIZED SIGNATURE</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

