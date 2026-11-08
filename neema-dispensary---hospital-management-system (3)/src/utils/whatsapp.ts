/**
 * Utility functions for real WhatsApp Web and direct communication
 * (Text messaging, voice call dispatch, video call invitations).
 */

export const OWNER_PHONE_NUMBER = '0763503097';
export const OWNER_PHONE_CLEAN = '255763503097';
export const HOSPITAL_LOCATION = 'Nyamongo, Tarime, Tanzania';

export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return OWNER_PHONE_CLEAN;
  let digits = phone.replace(/[^0-9]/g, '');
  // Tanzanian mobile numbers: 07XX or 06XX -> 2557XX / 2556XX
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '255' + digits.slice(1);
  } else if (!digits.startsWith('255') && digits.length === 9) {
    digits = '255' + digits;
  } else if (digits.length < 9) {
    return OWNER_PHONE_CLEAN;
  }
  return digits;
}

export function openWhatsAppWebChat(phone: string, text: string = ''): void {
  const clean = cleanWhatsAppNumber(phone || OWNER_PHONE_NUMBER);
  const encoded = encodeURIComponent(text);
  // Direct link to WhatsApp Web
  const webUrl = `https://web.whatsapp.com/send?phone=${clean}&text=${encoded}`;
  const directLink = `https://wa.me/${clean}?text=${encoded}`;
  
  // Use direct anchor dispatch so browser allows seamless popup/tab
  const a = document.createElement('a');
  a.href = webUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function openWhatsAppVoiceCall(phone: string, recipientName: string = 'Mfanyakazi'): void {
  const clean = cleanWhatsAppNumber(phone);
  const msg = `📞 [Simu ya Sauti ya WhatsApp - Neema Dispensary]\nHabari ${recipientName},\nNinapiga simu ya sauti ya kikazi kutoka Idara ya Hospitali ya Neema Dispensary. Tafadhali bonyeza kitufe cha kupiga simu ya WhatsApp sasa.`;
  openWhatsAppWebChat(clean, msg);
}

export function openWhatsAppVideoCall(phone: string, recipientName: string = 'Mhudumu / Mgonjwa', roomId?: string): string {
  const clean = cleanWhatsAppNumber(phone);
  const meetingId = roomId || `Telemed-${Date.now().toString().slice(-6)}`;
  const videoMeetingUrl = `https://meet.jit.si/NeemaDispensary-${meetingId}`;
  const msg = `📹 [Simu ya Video ya WhatsApp - Neema Dispensary]\nHabari ${recipientName},\nUmealikwa kwenye simu ya video ya kitengo cha matibabu/kikazi ya Neema Dispensary.\n\nJiunge moja kwa moja hapa:\n${videoMeetingUrl}\n\nTafadhali bonyeza kiungo hicho au jibu ujumbe huu.`;
  
  openWhatsAppWebChat(clean, msg);
  return videoMeetingUrl;
}
