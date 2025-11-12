import axios from 'axios';
const id = '<ID>';
axios.post(`http://localhost:5000/api/recipes/${id}/nutrition`).then(r => console.log(r.data)).catch(e => console.error(e.response?.data || e.message));