export const LIGHT_STYLE = `
body {
  background: #213a50;
  color: #1e1e1e;
}

#starCanvas {
  display: none;
}

.glass {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

label {
  color: #2c2c2c;
}

input,
select {
  background: rgba(255, 255, 255, 0.95);
  color: #1e1e1e;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

input:focus,
select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.2);
}

.tag-item {
  background: rgba(0, 0, 0, 0.05);
  color: #1e1e1e;
}

.tag-item:hover {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.tag-item.selected {
  background: linear-gradient(
    135deg,
    rgba(13, 110, 253, 0.85) 0%,
    rgba(0, 90, 230, 0.9) 100%
  );
  color: #ffffff;
}

.btn {
  background: #e7e7e7;
  color: #1e1e1e;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  filter: brightness(1.06);
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

#probTitle {
  color: #1e1e1e;
}

#probMeta {
  color: #555555;
}

#probTags {
  color: #006852;
}

#probSolved,
#probLink,
#max,
#min {
  color: #444444 !important;
}

#min, 
#max {
  background: #d0d7dc7a;
  border-color: #00000024;
}

.cf_color {
  background: linear-gradient(135deg, #075eab, #0862af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.status {
  color: #dfdadadc;
}

.badge.div1 {
  background: rgba(255, 70, 70, 0.18) !important;
  color: #b40000 !important;
}

.badge.div2 {
  background: rgba(70, 120, 255, 0.18) !important;
  color: #003b90 !important;
}

.badge.div3 {
  background: rgba(80, 200, 95, 0.18) !important;
  color: #007a2a !important;
}

.badge.div4 {
  background: rgba(200, 160, 40, 0.18) !important;
  color: #865f00 !important;
}

.badge.educational {
  background: rgba(170, 120, 255, 0.18) !important;
  color: #5a2fc0 !important;
}

.badge.rated {
  background: rgba(50, 180, 150, 0.18) !important;
  color: #006b55 !important;
}

.badge.unrated {
  background: rgba(0, 0, 0, 0.12) !important;
  color: #555 !important;
}

.badge.other {
  background: rgba(0, 0, 0, 0.15) !important;
  color: #444 !important;
}

#probTags span {
  background: #dfe8ff !important;
  color: #30579b !important;
  border: 1px solid rgba(30,60,120,0.2) !important;
  box-shadow: none !important;
}

footer {
  color: #e1dfdff5;
}

.cf_i {
    color: #1e1e1e !important;
}

.checkBox {
  opacity: 90%;
}
`;
