import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminEnquiryEmail, confirmationEmail } from '../lib/email-templates';
const data={name:'Sample <b>Person</b>',email:'sample@example.com',phone:'+442079460958',organisation:'Sample & Co',market:'UK',service:'business-development',message:'A sample opportunity <script>alert(1)</script>',privacy:true,website:''};
test('admin email shows enquiry details and escapes user input',()=>{const {subject,html,text}=adminEnquiryEmail(data);assert.match(subject,/Sample <b>Person<\/b> · Sample & Co/);assert.ok(html.includes('Sample &lt;b&gt;Person&lt;/b&gt;'));assert.ok(html.includes('Sample &amp; Co'));assert.ok(html.includes('Business Development'));assert.ok(!html.includes('<script>'));assert.match(text,/Organisation: Sample & Co/)});
test('confirmation email thanks the sender and promises contact within 24 hours',()=>{const {html,text}=confirmationEmail({...data,name:'Asha Rao'});assert.ok(html.includes('Thank you, Asha.'));assert.ok(html.includes('within 24 hours'));assert.match(text,/within 24 hours/)});
test('optional fields are marked as not provided',()=>{const {html}=adminEnquiryEmail({...data,organisation:'',market:'',service:''});assert.equal(html.match(/Not provided/g)?.length,3)});
test('admin email includes the phone number in HTML and plain text',()=>{const {html,text}=adminEnquiryEmail({...data,phone:'+44 20 7946 0958'});assert.ok(html.includes('+44 20 7946 0958'));assert.ok(html.includes('tel:+442079460958'));assert.match(text,/Phone number: \+44 20 7946 0958/)});
