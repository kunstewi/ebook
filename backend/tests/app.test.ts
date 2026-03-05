/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';

describe('App & Database Setup Environment', () => {
    it('should connect to the in-memory MongoDB database', () => {
        // 1 means connected
        expect(mongoose.connection.readyState).toBe(1);
    });

    it('should return 404 for an unknown API route', async () => {
        const response = await request(app).get('/api/this-route-does-not-exist');
        expect(response.status).toBe(404);
    });
});
