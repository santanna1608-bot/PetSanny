import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Camera, 
  Save, 
  AlertTriangle,
  Globe,
  Check
} from 'lucide-react';

// Avatares Fictícios com Emojis e Gradientes
export const AVATARS = [
  { id: 'avatar-dog', emoji: '🐶', name: 'Golden Toby', bg: 'from-amber-400 to-orange-500' },
  { id: 'avatar-cat', emoji: '🐱', name: 'Neko Nala', bg: 'from-indigo-400 to-violet-500' },
  { id: 'avatar-hamster', emoji: '🐹', name: 'Hamtaro', bg: 'from-rose-400 to-pink-500' },
  { id: 'avatar-parrot', emoji: '🦜', name: 'Loro', bg: 'from-emerald-400 to-teal-500' },
  { id: 'avatar-lion', emoji: '🦁', name: 'Simba', bg: 'from-yellow-400 to-amber-500' },
  { id: 'avatar-fox', emoji: '🦊', name: 'Todd', bg: 'from-orange-400 to-red-500' }
];

export const renderAvatarHelper = (avatarId?: string, sizeClass = 'w-10 h-10 text-base') => {
  const isCustomImage = avatarId && (avatarId.startsWith('data:image/') || avatarId.startsWith('http') || avatarId.startsWith('/'));
  
  if (isCustomImage) {
    return (
      <img 
        src={avatarId} 
        alt="Avatar" 
        className={`${sizeClass} rounded-full object-cover shadow-inner shrink-0 border border-stone-200`} 
      />
    );
  }

  const matched = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-tr ${matched.bg} flex items-center justify-center shadow-inner select-none shrink-0`}>
      <span>{matched.emoji}</span>
    </div>
  );
};

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useAppointments();
  const { t, language, setLanguage } = useLanguage();

  // Estados do Perfil
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.user_metadata?.avatar_url || 'avatar-dog');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        addToast(t('settings.file_too_large'), t('settings.file_too_large_desc'), 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedAvatar(base64String);
        addToast(t('settings.photo_loaded'), t('settings.photo_loaded_desc'), 'info');
      };
      reader.onerror = () => {
        addToast(t('settings.read_error'), t('settings.read_error_desc'), 'warning');
      };
      reader.readAsDataURL(file);
    }
  };

  // Estados de Segurança
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    // Aplica máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // Validação de senhas
    if (password && password !== confirmPassword) {
      setPasswordError(t('settings.passwords_dont_match'));
      addToast(t('settings.validation_error'), t('settings.passwords_dont_match_desc'), 'warning');
      return;
    }

    if (password && password.length < 6) {
      setPasswordError(t('settings.password_min_len'));
      addToast(t('settings.weak_password'), t('settings.password_min_digits'), 'warning');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        avatar_url: selectedAvatar,
        email: email !== user?.email ? email : undefined,
        password: password || undefined
      });

      addToast(
        t('settings.profile_updated'),
        t('settings.profile_updated_desc'),
        'success'
      );
      
      // Limpa campos de senha
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao atualizar configurações:', err);
      addToast(t('settings.error_saving'), err.message || t('settings.error_saving_desc'), 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-stone-850 dark:text-stone-100 font-sans">
      
      {/* Cabeçalho da Tela */}
      <div className="border-b border-stone-200 dark:border-stone-850 pb-6 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-olive-500/10 text-olive-650">
          <User className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-stone-855 dark:text-stone-100 font-sans tracking-tight">
            {t('settings.title')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Avatar Selector (Visual e Premium) */}
        <div className="lg:col-span-1 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 flex flex-col items-center gap-6">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider block self-start">
            {t('settings.photo_profile')}
          </span>

          {/* Prévia Gigante do Avatar Selecionado */}
          <button 
            type="button" 
            onClick={() => document.getElementById('avatar-upload-input')?.click()}
            className="relative group focus:outline-none cursor-pointer"
            title="Enviar foto personalizada"
          >
            {renderAvatarHelper(selectedAvatar, 'w-24 h-24 text-4xl')}
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 shadow text-stone-655 dark:text-stone-300 group-hover:bg-stone-550 group-hover:scale-105 transition-all">
              <Camera className="w-4 h-4" />
            </div>
          </button>
          
          <input 
            type="file" 
            id="avatar-upload-input" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />

          <div className="text-center">
            <h4 className="font-extrabold text-xs text-stone-800 dark:text-stone-200 uppercase tracking-wider">{t('settings.select_mascot')}</h4>
            <p className="text-[10px] text-stone-450 dark:text-stone-400 mt-0.5">{t('settings.mascot_desc')}</p>
          </div>

          {/* Grid de Seleção de Avatares */}
          <div className="grid grid-cols-3 gap-3.5 w-full">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setSelectedAvatar(av.id)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1 hover:-translate-y-0.5 ${
                  selectedAvatar === av.id
                    ? 'bg-olive-50/50 dark:bg-olive-950/20 border-olive-500 ring-2 ring-olive-500/10'
                    : 'bg-stone-50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${av.bg} flex items-center justify-center text-sm shadow-inner`}>
                  <span>{av.emoji}</span>
                </div>
                <span className="text-[8px] font-bold text-stone-500 dark:text-stone-400 truncate max-w-full leading-none mt-1">
                  {av.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Botão de Upload de Imagem Personalizada */}
          <button
            type="button"
            onClick={() => document.getElementById('avatar-upload-input')?.click()}
            className="w-full flex items-center justify-center gap-1.5 border border-dashed border-stone-300 dark:border-stone-800 hover:border-olive-500 bg-stone-50 dark:bg-stone-950/40 hover:bg-olive-50/20 dark:hover:bg-olive-950/20 text-stone-655 hover:text-olive-850 dark:text-stone-400 dark:hover:text-olive-350 font-bold text-[10px] py-2.5 rounded-2xl transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            {t('settings.upload_custom')}
          </button>
        </div>

        {/* Coluna 2: Informações de Perfil e Acesso */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Informações Pessoais */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-xs text-stone-850 dark:text-stone-100 uppercase tracking-wider border-b border-stone-150 dark:border-stone-800 pb-2.5 flex items-center gap-2">
              <User className="w-4 h-4 text-stone-555 dark:text-stone-400" />
              {t('settings.personal_info')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  {t('settings.full_name')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Juliana"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-850 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all font-medium"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-455 dark:text-stone-500">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  {t('settings.phone')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: (11) 98888-5555"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all font-medium"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 dark:text-stone-500">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Credenciais de Acesso */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-xs text-stone-850 dark:text-stone-100 uppercase tracking-wider border-b border-stone-150 dark:border-stone-800 pb-2.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-500" />
              {t('settings.security')}
            </h3>

            {/* E-mail de Acesso */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                {t('settings.corp_email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nome@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all font-semibold"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 dark:text-stone-550">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[9px] text-stone-450 dark:text-stone-500 block italic">
                {t('settings.email_warning')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  {t('settings.new_password')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all font-mono"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 dark:text-stone-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
                  {t('settings.confirm_password')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-800 focus:border-olive-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all font-mono"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 dark:text-stone-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-955/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-850 dark:text-rose-300 rounded-xl text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          {/* Preferência de Idioma */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-4">
            <h3 className="font-extrabold text-xs text-stone-850 dark:text-stone-100 uppercase tracking-wider border-b border-stone-150 dark:border-stone-800 pb-2.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-stone-555 dark:text-stone-400" />
              {t('settings.sys_language')}
            </h3>
            <p className="text-[10px] text-stone-450 dark:text-stone-400">
              {t('settings.sys_language_desc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['pt', 'en', 'es'] as const).map((lang) => {
                const langLabels = {
                  pt: { name: t('settings.lang_pt'), flag: '🇧🇷' },
                  en: { name: t('settings.lang_en'), flag: '🇺🇸' },
                  es: { name: t('settings.lang_es'), flag: '🇪🇸' },
                };
                const isSelected = language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-olive-500 bg-olive-500/5 text-olive-600 dark:text-olive-400 shadow-sm'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{langLabels[lang].flag}</span>
                      <span>{langLabels[lang].name}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-olive-650 dark:text-olive-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 bg-olive-600 hover:bg-olive-750 disabled:bg-olive-400 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md shadow-olive-900/10 transition-all cursor-pointer hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('settings.save_changes')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
