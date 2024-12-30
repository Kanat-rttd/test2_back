SELECT
    ClientName AS client,
    SUM(Sales) AS sales,
    SUM(Returns) AS returns,
    SUM(Overhead) AS overhead,
    SUM(Payments) AS payments,
    SUM(Credit) AS credit,
    SUM(Debit) AS debit,
    SUM(Debt) AS debt
FROM
    ReportView
GROUP BY
    client;