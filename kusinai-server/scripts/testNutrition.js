/*
	File: scripts/testNutrition.js
	Purpose: Developer utility to test nutrition calculations/integrations.
	Responsibilities:
	- Exercise nutrition parsing/lookup logic and print results.
	- Help verify correctness and performance during development.
	Notes: Not part of production flow; safe to modify for experiments.
*/
import axios from 'axios';
const id = '<ID>';
axios.post(`http://localhost:5000/api/recipes/${id}/nutrition`).then(r => console.log(r.data)).catch(e => console.error(e.response?.data || e.message));