// main.js — tiny entry that imports makePost and creates demo posts
import { makePost } from './post.js';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.querySelector('.container');
	if (!container) return;

	// Load posts from data.json and render them. Serve the folder over HTTP for fetch to work.
	fetch('./data.json')
		.then(res => {
			if (!res.ok) throw new Error(`Failed to fetch data.json: ${res.status}`);
			return res.json();
		})
		.then(posts => {
			if (!Array.isArray(posts)) throw new Error('data.json must contain an array');
			posts.forEach(post => makePost(post, container));
		})
				.catch(err => {
					console.error('Error loading posts:', err);
					// Fallback: show a minimal demo post so the UI still renders
					makePost({
						author: 'Fallback',
						caption: 'Kon niet laden: bekijk de console voor details',
						likes: 0,
						comments: 0,
						avatar: '',
						image: ''
					}, container);
				});
});

