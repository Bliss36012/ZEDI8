import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { AnimeMascot } from './AnimeMascot';
import { AnimeAvatarConfig } from '../../types/hospital';
import { Sparkles, X, Check, Wand2, RefreshCw } from 'lucide-react';

export const AvatarCreatorModal: React.FC = () => {
  const {
    currentUser,
    userAccounts,
    updateAnimeAvatarConfig,
    isAvatarCreatorOpen,
    setIsAvatarCreatorOpen,
  } = useHospital();

  const [selectedLeaderId, setSelectedLeaderId] = useState(currentUser.id);

  // Active target leader account
  const targetLeader = userAccounts.find((u) => u.id === selectedLeaderId) || currentUser;

  // Customizer state initialized from target leader's current config or defaults
  const [gender, setGender] = useState<'female' | 'male'>(
    targetLeader.avatarConfig?.gender || (targetLeader.name.includes('Mama') || targetLeader.name.includes('Sister') || targetLeader.name.includes('Amina') || targetLeader.name.includes('Beatrice') || targetLeader.name.includes('Faith') || targetLeader.name.includes('Happiness') ? 'female' : 'male')
  );
  const [skinTone, setSkinTone] = useState(targetLeader.avatarConfig?.skinTone || '#6F4E37');
  const [hairStyle, setHairStyle] = useState(targetLeader.avatarConfig?.hairStyle || 'curly');
  const [hairColor, setHairColor] = useState(targetLeader.avatarConfig?.hairColor || '#1F2937');
  const [scrubColor, setScrubColor] = useState(targetLeader.avatarConfig?.scrubColor || '#0D9488');
  const [expression, setExpression] = useState<'smile' | 'wink' | 'focused' | 'cheerful'>(
    targetLeader.avatarConfig?.expression || 'smile'
  );
  const [accessory, setAccessory] = useState<'stethoscope' | 'glasses' | 'mask' | 'headlamp' | 'badge' | 'clipboard' | 'none'>(
    targetLeader.avatarConfig?.accessory || 'stethoscope'
  );
  const [catchphrase, setCatchphrase] = useState(
    targetLeader.avatarConfig?.catchphrase || 'Afya Yako, Wajibu Wetu!'
  );
  const [motilitySpeed, setMotilitySpeed] = useState<'calm' | 'lively' | 'hyper'>(
    targetLeader.avatarConfig?.motilitySpeed || 'lively'
  );

  // When changing selected leader in dropdown, populate state
  const handleSelectLeader = (leaderId: string) => {
    setSelectedLeaderId(leaderId);
    const leader = userAccounts.find((u) => u.id === leaderId);
    if (leader?.avatarConfig) {
      setGender(leader.avatarConfig.gender);
      setSkinTone(leader.avatarConfig.skinTone);
      setHairStyle(leader.avatarConfig.hairStyle);
      setHairColor(leader.avatarConfig.hairColor);
      setScrubColor(leader.avatarConfig.scrubColor);
      setExpression(leader.avatarConfig.expression);
      setAccessory(leader.avatarConfig.accessory);
      setCatchphrase(leader.avatarConfig.catchphrase);
      setMotilitySpeed(leader.avatarConfig.motilitySpeed);
    }
  };

  const previewConfig: AnimeAvatarConfig = {
    gender,
    skinTone,
    hairStyle,
    hairColor,
    scrubColor,
    expression,
    accessory,
    catchphrase,
    motilitySpeed,
  };

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnimeAvatarConfig(selectedLeaderId, previewConfig);
    setIsAvatarCreatorOpen(false);
  };

  // Tanzanian and hospital presets
  const skinTonePresets = [
    { label: 'Espresso ya Kahawa', hex: '#3E2415' },
    { label: 'Shaba ya Dhahabu', hex: '#5C3826' },
    { label: 'Caramel ya Kitanzania', hex: '#6F4E37' },
    { label: 'Kahawia Iliyoiva', hex: '#8D5524' },
    { label: 'Ngano / Shaba Nyepesi', hex: '#A1662F' },
  ];

  const scrubPresets = [
    { label: 'Zahanati Emerald', hex: '#0D9488' },
    { label: 'Uongozi Navy', hex: '#0F766E' },
    { label: 'Daktari Blue', hex: '#2563EB' },
    { label: 'Wodi ya Wanawake Pink', hex: '#BE185D' },
    { label: 'Maabara Green', hex: '#059669' },
    { label: 'Famasia Violet', hex: '#7C3AED' },
    { label: 'Kipato Amber', hex: '#D97706' },
    { label: 'Usalama Slate', hex: '#334155' },
  ];

  if (!isAvatarCreatorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20">
              <Wand2 className="h-5 w-5 text-amber-300 animate-spin" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide">
                STUDIO YA KUTENGENEZA AVATAR (ANIME CREATOR)
              </h3>
              <p className="text-xs text-teal-200">
                Kila kiongozi wa idara anaunda umbo lake la anime linalotumika kwenye mfumo mzima
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAvatarCreatorOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/20 transition text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Leader Switcher if Admin/Manager */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              Chagua Kiongozi wa Idara unayemtengenezea Avatar:
            </span>
            <select
              value={selectedLeaderId}
              onChange={(e) => handleSelectLeader(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {userAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — {acc.role.toUpperCase()} ({acc.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center p-6 rounded-3xl bg-gradient-to-b from-teal-50/70 to-neutral-100 dark:from-neutral-800/60 dark:to-neutral-900 border border-teal-200/50 dark:border-neutral-800 text-center space-y-3 sticky top-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2.5 py-0.5 rounded-full">
                Muonekano wa Moja kwa Moja (Live Preview)
              </span>

              <div className="py-4">
                <AnimeMascot
                  role={targetLeader.role}
                  config={previewConfig}
                  size="xl"
                  isMotile={true}
                  speakingText={catchphrase}
                />
              </div>

              <div className="w-full text-left space-y-1 p-3 bg-white/80 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[11px]">
                <div><span className="text-neutral-500">Kiongozi:</span> <strong>{targetLeader.name}</strong></div>
                <div><span className="text-neutral-500">Idara:</span> <strong className="text-teal-600">{targetLeader.department}</strong></div>
                <div><span className="text-neutral-500">Mwendo wa Motile:</span> <span className="capitalize">{motilitySpeed}</span></div>
              </div>
            </div>

            {/* Right Customization Controls */}
            <form onSubmit={handleSaveAvatar} className="md:col-span-7 space-y-5">
              {/* Gender & Persona */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Jinsia ya Mhusika (Gender):</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                        gender === g
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {g === 'female' ? 'Kike (Female)' : 'Kiume (Male)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Rangi ya Ngozi (Skin Tone):</label>
                <div className="flex flex-wrap gap-2">
                  {skinTonePresets.map((s) => (
                    <button
                      key={s.hex}
                      type="button"
                      onClick={() => setSkinTone(s.hex)}
                      className={`h-8 w-8 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                        skinTone === s.hex ? 'border-teal-500 ring-2 ring-teal-500/40 scale-105' : 'border-white dark:border-neutral-800'
                      }`}
                      style={{ backgroundColor: s.hex }}
                      title={s.label}
                    >
                      {skinTone === s.hex && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hairstyle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Mtindo wa Nywele / Kilemba (Hairstyle):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hijab', label: 'Hijab / Kilemba' },
                    { id: 'curly', label: 'Curly / Mawimbi' },
                    { id: 'braids', label: 'Braids / Kusuka' },
                    { id: 'short', label: 'Nywele Fupi (Short)' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHairStyle(h.id)}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition text-center truncate ${
                        hairStyle === h.id
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubs / Uniform Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Rangi ya Sare ya Idara (Scrubs Color):</label>
                <div className="flex flex-wrap gap-2">
                  {scrubPresets.map((sc) => (
                    <button
                      key={sc.hex}
                      type="button"
                      onClick={() => setScrubColor(sc.hex)}
                      className={`h-8 w-8 rounded-xl border-2 transition transform hover:scale-110 flex items-center justify-center ${
                        scrubColor === sc.hex ? 'border-teal-500 ring-2 ring-teal-500/40' : 'border-white dark:border-neutral-800'
                      }`}
                      style={{ backgroundColor: sc.hex }}
                      title={sc.label}
                    >
                      {scrubColor === sc.hex && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facial Expression & Emotion */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Tabasamu na Hisia (Expression):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'smile', label: 'Tabasamu 😊' },
                    { id: 'wink', label: 'Kukonyeza 😉' },
                    { id: 'cheerful', label: 'Furaha Kubwa 😃' },
                    { id: 'focused', label: 'Makini 🧐' },
                  ].map((exp) => (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExpression(exp.id as any)}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition text-center truncate ${
                        expression === exp.id
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Vifaa Tiba / Mapambo (Accessory):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'stethoscope', label: 'Stethoscope 🩺' },
                    { id: 'glasses', label: 'Miwani 👓' },
                    { id: 'badge', label: 'Kitambulisho 🪪' },
                    { id: 'clipboard', label: 'Faili la Wodi 📋' },
                    { id: 'headlamp', label: 'Taa ya Upasuaji 🔦' },
                    { id: 'mask', label: 'Barakoa 😷' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccessory(acc.id as any)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition text-center truncate ${
                        accessory === acc.id
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motto / Catchphrase */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Kauli Mbiu / Salamu ya Anime (Catchphrase):</label>
                <input
                  type="text"
                  value={catchphrase}
                  onChange={(e) => setCatchphrase(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold"
                  placeholder="Mf: Afya Yako Kipaumbele Chetu!"
                  maxLength={50}
                />
              </div>

              {/* Motility Speed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Kasi ya Mjongeo wa Uhuishaji (Motility Speed):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'calm', label: 'Mtulivu (Calm)' },
                    { id: 'lively', label: 'Changamfu (Lively)' },
                    { id: 'hyper', label: 'Mchangamfu Zaidi (Hyper)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setMotilitySpeed(s.id as any)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition text-center ${
                        motilitySpeed === s.id
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAvatarCreatorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/30 transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Hifadhi Avatar ya {targetLeader.name.split(' ')[0]}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
