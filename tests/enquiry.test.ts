import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry } from '../lib/enquiry';
const valid={name:'Sample Person',email:'sample@example.com',organisation:'Sample company',market:'UK',service:'business-development',message:'A sample opportunity for local testing only.',privacy:true,website:''};
test('accepts a valid enquiry with optional fields omitted',()=>{assert.deepEqual(validateEnquiry({...valid,organisation:'',market:'',service:''}).errors,{})});
test('requires name, valid email, meaningful message and acknowledgement',()=>{const {errors}=validateEnquiry({name:'',email:'invalid',message:'short',privacy:false});assert.deepEqual(Object.keys(errors),['name','email','message','privacy'])});
test('rejects email header injection and unknown services',()=>{const {errors}=validateEnquiry({...valid,email:'test@example.com\r\nBcc: other@example.com',service:'unapproved'});assert.ok(errors.email);assert.ok(errors.service)});
test('rejects oversized and wrong type fields',()=>{const {errors}=validateEnquiry({...valid,name:'a'.repeat(101),organisation:[],message:'x'.repeat(3001)});assert.ok(errors.name);assert.ok(errors.organisation);assert.ok(errors.message)});
test('rejects non-object request bodies',()=>{for(const body of [null,[],42,'text'])assert.ok(validateEnquiry(body).errors.form)});
