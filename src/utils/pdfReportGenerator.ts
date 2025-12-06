/**
 * PDF Report Generator Utilities
 * Generates print-friendly HTML for various report types
 */

interface CompanyInfo {
  companyName?: string;
  address?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  logo?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

const getCommonStyles = () => `
  body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 40px; background-color: #f3f4f6; color: #111827; }
  .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
  .logo { height: 56px; width: auto; object-fit: contain; margin-bottom: 8px; }
  .company-name { font-size: 24px; font-weight: 700; margin-top: 4px; }
  .company-meta { font-size: 12px; color: #4b5563; margin-top: 4px; line-height: 1.5; max-width: 520px; margin-left: auto; margin-right: auto; }
  .title { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #4b5563; margin-bottom: 16px; }
  .section { margin-top: 24px; }
  .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; border-radius: 12px; overflow: hidden; }
  th, td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: left; }
  th { background-color: #f9fafb; font-weight: 600; }
  tr:nth-child(even) td { background-color: #f9fafb; }
  .right { text-align: right; }
  .center { text-align: center; }
  .footer { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: right; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge-success { background-color: #dcfce7; color: #15803d; }
  .badge-warning { background-color: #fef3c7; color: #92400e; }
  .badge-danger { background-color: #fee2e2; color: #991b1b; }
  .badge-info { background-color: #dbeafe; color: #1e40af; }
`;

const getHeaderHTML = (company: CompanyInfo, title: string, periodLabel: string) => `
  <div class="header">
    ${company.logo ? `<img src="${company.logo}" alt="Company Logo" class="logo" />` : ""}
    <div class="company-name">${company.companyName || "Company Name"}</div>
    <div class="company-meta">
      ${company.address ? `${company.address}<br/>` : ""}
      ${company.email ? `Email: ${company.email} | ` : ""}
      ${company.phone ? `Phone: ${company.phone}` : ""}
      ${company.gstNumber ? `<br/>GST: ${company.gstNumber}` : ""}
    </div>
  </div>
  <div class="title">${title}</div>
  <div class="subtitle">Reporting Period: ${periodLabel}</div>
`;

export const generateSalesReportPDF = (data: any, company: CompanyInfo, periodLabel: string) => {
  const { onlineOrders = [], offlineSales = [], onlineTotal = 0, offlineTotal = 0, totalSales = 0 } = data;
  
  const onlineRowsHtml = onlineOrders.slice(0, 50).map((order: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${order.invoice_number || order._id}</td>
      <td>${order.user_id?.name || 'N/A'}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td class="right">${formatCurrency(order.total_amount)}</td>
      <td class="center"><span class="badge badge-${order.status === 'delivered' ? 'success' : 'warning'}">${order.status}</span></td>
    </tr>
  `).join("");

  const offlineRowsHtml = offlineSales.slice(0, 50).map((sale: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${sale.invoiceNumber || sale._id}</td>
      <td>${sale.customerName || 'Walk-in Customer'}</td>
      <td>${new Date(sale.date || sale.createdAt).toLocaleDateString()}</td>
      <td class="right">${formatCurrency(sale.totalAmount)}</td>
      <td class="center"><span class="badge badge-success">completed</span></td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sales Report</title>
    <style>${getCommonStyles()}</style>
  </head>
  <body onload="window.print(); window.close();">
    ${getHeaderHTML(company, "Sales Report", periodLabel)}
    
    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr><th>Description</th><th class="right">Amount (INR)</th></tr>
        <tr><td>Online Sales</td><td class="right">${formatCurrency(onlineTotal)}</td></tr>
        <tr><td>Offline Sales</td><td class="right">${formatCurrency(offlineTotal)}</td></tr>
        <tr><td><strong>Total Sales</strong></td><td class="right"><strong>${formatCurrency(totalSales)}</strong></td></tr>
      </table>
    </div>

    ${onlineOrders.length > 0 ? `
    <div class="section">
      <div class="section-title">Online Sales (Top 50)</div>
      <table>
        <tr><th>#</th><th>Invoice</th><th>Customer</th><th>Date</th><th class="right">Amount</th><th class="center">Status</th></tr>
        ${onlineRowsHtml || '<tr><td colspan="6" class="center">No data</td></tr>'}
      </table>
    </div>` : ''}

    ${offlineSales.length > 0 ? `
    <div class="section">
      <div class="section-title">Offline Sales (Top 50)</div>
      <table>
        <tr><th>#</th><th>Invoice</th><th>Customer</th><th>Date</th><th class="right">Amount</th><th class="center">Status</th></tr>
        ${offlineRowsHtml || '<tr><td colspan="6" class="center">No data</td></tr>'}
      </table>
    </div>` : ''}

    <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  </body>
</html>`;

  return html;
};

export const generateOrdersReportPDF = (data: any, company: CompanyInfo, periodLabel: string) => {
  const { orders = [], totalOrders = 0, statusBreakdown = {}, totalRevenue = 0 } = data;

  const statusRows = Object.entries(statusBreakdown).map(([status, count]) => `
    <tr><td>${status}</td><td class="right">${count}</td></tr>
  `).join("");

  const orderRowsHtml = orders.slice(0, 50).map((order: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${order.invoice_number || order._id}</td>
      <td>${order.user_id?.name || 'N/A'}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td class="right">${formatCurrency(order.total_amount)}</td>
      <td class="center"><span class="badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}">${order.status}</span></td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Orders Report</title>
    <style>${getCommonStyles()}</style>
  </head>
  <body onload="window.print(); window.close();">
    ${getHeaderHTML(company, "Orders Report", periodLabel)}
    
    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr><th>Description</th><th class="right">Value</th></tr>
        <tr><td>Total Orders</td><td class="right">${totalOrders}</td></tr>
        <tr><td>Total Revenue</td><td class="right">${formatCurrency(totalRevenue)}</td></tr>
        <tr><td>Average Order Value</td><td class="right">${formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Status Breakdown</div>
      <table>
        <tr><th>Status</th><th class="right">Count</th></tr>
        ${statusRows || '<tr><td colspan="2" class="center">No data</td></tr>'}
      </table>
    </div>

    ${orders.length > 0 ? `
    <div class="section">
      <div class="section-title">Orders (Top 50)</div>
      <table>
        <tr><th>#</th><th>Invoice</th><th>Customer</th><th>Date</th><th class="right">Amount</th><th class="center">Status</th></tr>
        ${orderRowsHtml || '<tr><td colspan="6" class="center">No data</td></tr>'}
      </table>
    </div>` : ''}

    <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  </body>
</html>`;

  return html;
};

export const generateCustomersReportPDF = (data: any, company: CompanyInfo, periodLabel: string) => {
  const { customers = [], totalCustomers = 0, verifiedCustomers = 0, activeCustomers = 0 } = data;

  const customerRowsHtml = customers.slice(0, 50).map((customer: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone || 'N/A'}</td>
      <td class="right">${customer.orderCount || 0}</td>
      <td class="right">${formatCurrency(customer.totalSpent || 0)}</td>
      <td class="center"><span class="badge badge-${customer.isVerified ? 'success' : 'warning'}">${customer.isVerified ? 'Verified' : 'Unverified'}</span></td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Customers Report</title>
    <style>${getCommonStyles()}</style>
  </head>
  <body onload="window.print(); window.close();">
    ${getHeaderHTML(company, "Customer Base Report", periodLabel)}
    
    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr><th>Description</th><th class="right">Value</th></tr>
        <tr><td>Total Customers</td><td class="right">${totalCustomers}</td></tr>
        <tr><td>Verified Customers</td><td class="right">${verifiedCustomers}</td></tr>
        <tr><td>Active Customers</td><td class="right">${activeCustomers}</td></tr>
      </table>
    </div>

    ${customers.length > 0 ? `
    <div class="section">
      <div class="section-title">Customers (Top 50)</div>
      <table>
        <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th class="right">Orders</th><th class="right">Total Spent</th><th class="center">Status</th></tr>
        ${customerRowsHtml || '<tr><td colspan="7" class="center">No data</td></tr>'}
      </table>
    </div>` : ''}

    <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  </body>
</html>`;

  return html;
};

export const generateRevenueReportPDF = (data: any, company: CompanyInfo, periodLabel: string) => {
  const { monthlyRevenue = [], totalRevenue = 0, averageMonthlyRevenue = 0 } = data;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueRowsHtml = monthlyRevenue.map((item: any) => `
    <tr>
      <td>${monthNames[item._id.month - 1]} ${item._id.year}</td>
      <td class="right">${item.count}</td>
      <td class="right">${formatCurrency(item.revenue)}</td>
      <td class="right">${formatCurrency(item.count > 0 ? item.revenue / item.count : 0)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Revenue Report</title>
    <style>${getCommonStyles()}</style>
  </head>
  <body onload="window.print(); window.close();">
    ${getHeaderHTML(company, "Revenue Report", periodLabel)}
    
    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr><th>Description</th><th class="right">Amount (INR)</th></tr>
        <tr><td>Total Revenue</td><td class="right">${formatCurrency(totalRevenue)}</td></tr>
        <tr><td>Average Monthly Revenue</td><td class="right">${formatCurrency(averageMonthlyRevenue)}</td></tr>
      </table>
    </div>

    ${monthlyRevenue.length > 0 ? `
    <div class="section">
      <div class="section-title">Monthly Breakdown</div>
      <table>
        <tr><th>Period</th><th class="right">Orders</th><th class="right">Revenue</th><th class="right">Avg Order Value</th></tr>
        ${revenueRowsHtml || '<tr><td colspan="4" class="center">No data</td></tr>'}
      </table>
    </div>` : ''}

    <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  </body>
</html>`;

  return html;
};

export const generateTaxReportPDF = (data: any, company: CompanyInfo, periodLabel: string) => {
  const { orders = [], totalTax = 0, totalSales = 0, taxableAmount = 0, orderCount = 0 } = data;

  const taxRowsHtml = orders.slice(0, 50).map((order: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${order.invoice_number || order._id}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td class="right">${formatCurrency(order.total_amount - (order.tax_amount || 0))}</td>
      <td class="right">${order.tax_rate || 5}%</td>
      <td class="right">${formatCurrency(order.tax_amount || 0)}</td>
      <td class="right">${formatCurrency(order.total_amount)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Tax Report</title>
    <style>${getCommonStyles()}</style>
  </head>
  <body onload="window.print(); window.close();">
    ${getHeaderHTML(company, "Tax Report", periodLabel)}
    
    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr><th>Description</th><th class="right">Amount (INR)</th></tr>
        <tr><td>Total Taxable Amount</td><td class="right">${formatCurrency(taxableAmount)}</td></tr>
        <tr><td>Total Tax Collected</td><td class="right">${formatCurrency(totalTax)}</td></tr>
        <tr><td>Total Sales (Incl. Tax)</td><td class="right">${formatCurrency(totalSales)}</td></tr>
        <tr><td>Number of Orders</td><td class="right">${orderCount}</td></tr>
      </table>
    </div>

    ${orders.length > 0 ? `
    <div class="section">
      <div class="section-title">Tax Details (Top 50 Orders)</div>
      <table>
        <tr><th>#</th><th>Invoice</th><th>Date</th><th class="right">Taxable</th><th class="right">Rate</th><th class="right">Tax</th><th class="right">Total</th></tr>
        ${taxRowsHtml || '<tr><td colspan="7" class="center">No data</td></tr>'}
      </table>
    </div>` : ''}

    <div class="footer">Generated on ${new Date().toLocaleString()}</div>
  </body>
</html>`;

  return html;
};

export const openPDFWindow = (html: string) => {
  const printWindow = window.open("", "_blank", "width=900,height=650");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups to export the PDF.");
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
