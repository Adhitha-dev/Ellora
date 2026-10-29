const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Set NODE_ENV to test before requiring app
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret';

const { app, sanitizer, moment } = require('../index.js');

describe('Ellora Unit & Integration Tests', () => {
	let testServer;
	let baseUrl;

	before(async () => {
		// Start test server on random available port
		await new Promise((resolve) => {
			testServer = http.createServer(app);
			testServer.listen(0, () => {
				const port = testServer.address().port;
				baseUrl = `http://localhost:${port}`;
				resolve();
			});
		});
	});

	after(async () => {
		await new Promise((resolve) => {
			testServer.close(resolve);
		});
	});

	describe('Health Check Route (/health)', () => {
		it('should return HTTP 200 with status UP', async () => {
			const res = await fetch(`${baseUrl}/health`);
			assert.equal(res.status, 200);

			const body = await res.json();
			assert.equal(body.status, 'UP');
			assert.equal(body.app, 'Ellora');
			assert.ok(body.timestamp);
		});
	});

	describe('Sanitizer Utility', () => {
		it('should strip script tags from user inputs', () => {
			const dirtyInput = '<script>alert("xss")</script>Hello <b>World</b>';
			const clean = sanitizer(dirtyInput);
			assert.equal(clean.includes('<script>'), false);
			assert.equal(clean.includes('Hello <b>World</b>'), true);
		});

		it('should preserve allowed markdown tags like em and strong', () => {
			const input = '<em>Emphasis</em> and <strong>Strong</strong>';
			const clean = sanitizer(input);
			assert.equal(clean, input);
		});
	});

	describe('Moment Date/Time Utility', () => {
		it('should return formatted time and date arrays', () => {
			const [time, date] = moment();
			assert.ok(Array.isArray(time), 'Time should be an array');
			assert.ok(Array.isArray(date), 'Date should be an array');
			assert.ok(time.length > 0);
			assert.ok(date.length > 0);
		});
	});
});
