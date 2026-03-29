import React from "react";

const KpiCard = ({ title, value }) => {
  return (
    <div className="kpi-card">
      <h3 className="kpi-card__title">{title}</h3>
      <p className="kpi-card__value">{value}</p>
    </div>
  );
};

export default KpiCard;
