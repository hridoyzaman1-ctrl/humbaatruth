import { ContactInfo, AboutInfo, contactInfoData, aboutInfoData } from '@/data/siteContactData';

const CONTACTS_KEY = 'truthlens_contacts';
const ABOUT_KEY = 'truthlens_about';

// Contact Info
export const getContacts = (): ContactInfo[] => {
    const data = localStorage.getItem(CONTACTS_KEY);
    if (!data) return contactInfoData;
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing contacts', error);
        return contactInfoData;
    }
};

export const saveContacts = (contacts: ContactInfo[]) => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new Event('contactsUpdated'));
};

// About Info
export const getAboutInfo = (): AboutInfo[] => {
    const data = localStorage.getItem(ABOUT_KEY);
    if (!data) return aboutInfoData;
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing about info', error);
        return aboutInfoData;
    }
};

export const saveAboutInfo = (about: AboutInfo[]) => {
    localStorage.setItem(ABOUT_KEY, JSON.stringify(about));
    window.dispatchEvent(new Event('aboutInfoUpdated'));
};
