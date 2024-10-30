SELECT
    ClientName          AS client,
    MONTH(adjustedDate) AS month,
    YEAR(adjustedDate)  AS year,
    SUM(Credit)         AS credit,
    SUM(Payments)       AS payments,
    SUM(Expenses)       AS expenses,
    SUM(Overhead)       AS overhead,
    SUM(Returns)        AS returns,
    SUM(Sales)          AS sales,
    SUM(Debt)           AS debt
FROM
    ReportView
GROUP BY
    client, month, year;