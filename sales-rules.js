(function(root){
Funnel.labels.lotQuantity='Cantidad de lotes vendidos';
const quantity=c=>{const v=String(Funnel.value(c,'lotQuantity')).trim();if(!/^\d+$/.test(v))return null;const n=Number(v);return Number.isSafeInteger(n)&&n>0?n:null;};
const date=c=>{const v=CRM.dateValue(Funnel.value(c,'saleDate'));if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return null;const d=new Date(v+'T12:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===v?v:null;};
function range(today,period='30'){const d=new Date(today+'T12:00:00Z'),end=new Date(d),start=new Date(d);if(/^\d{4}-\d{2}$/.test(period)&&Number(period.slice(5))>=1&&Number(period.slice(5))<=12){const [y,m]=period.split('-').map(Number);start.setUTCFullYear(y,m-1,1);end.setUTCFullYear(y,m,0);}else if(period==='previous'){start.setUTCDate(1);start.setUTCMonth(start.getUTCMonth()-1);end.setUTCDate(0);}else if(period==='month')start.setUTCDate(1);else start.setUTCDate(start.getUTCDate()-29);return {start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)};}
function report(leads,today,period='30'){const r=range(today,period),closed=leads.filter(c=>Funnel.stage(c)==='Cerrado'),rows=closed.filter(c=>date(c)&&date(c)>=r.start&&date(c)<=r.end);return {...r,rows,lots:rows.reduce((n,c)=>n+(quantity(c)||0),0),missingQuantity:rows.filter(c=>quantity(c)===null),missingDate:closed.filter(c=>!date(c)),value:rows.reduce((n,c)=>n+Funnel.money(Funnel.value(c,'saleValue')),0)};}
const originalMissing=Funnel.missing;Funnel.missing=(c,target)=>{const m=originalMissing(c,target);if((target||Funnel.stage(c))==='Cerrado'&&quantity(c)===null)m.push('Cantidad de lotes vendidos: entero positivo');return m;};
root.Sales={quantity,date,range,report};
})(typeof window!=='undefined'?window:globalThis);
