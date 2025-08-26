import { useState, useEffect } from 'react';
import { getCompanySettings, getPrintSettings, CompanySettings, PrintTemplateSettings } from '@/lib/storage';

export const useSettings = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings());
  const [printSettings, setPrintSettings] = useState<PrintTemplateSettings>(getPrintSettings());

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setCompanySettings(getCompanySettings());
      setPrintSettings(getPrintSettings());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleSettingsUpdate = () => {
      handleStorageChange();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return {
    companySettings,
    printSettings,
    refreshSettings: () => {
      setCompanySettings(getCompanySettings());
      setPrintSettings(getPrintSettings());
    }
  };
}; 