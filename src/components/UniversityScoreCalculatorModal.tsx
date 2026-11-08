import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  BookOpen,
  Award,
  ChevronDown,
  Layers,
  RotateCcw,
} from 'lucide-react';
import {
  UniversityFormulaProfile,
  UniversityMajor,
  UniversityAdmissionMethod,
} from '../types';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversityScoreCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [profiles, setProfiles] = useState<UniversityFormulaProfile[]>(() =>
    StorageService.getUniversityFormulas()
  );
  const [disclaimerNote, setDisclaimerNote] = useState<string>(() =>
    StorageService.getUniversityDisclaimerNote()
  );

  // 3-Tier Step-by-Step Selection State (Trường -> Ngành -> Phương thức -> Điểm chuẩn)
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [inputValues, setInputValues] = useState<Record<string, number>>({});

  const reloadData = () => {
    const latest = StorageService.getUniversityFormulas();
    setProfiles(latest);
    setDisclaimerNote(StorageService.getUniversityDisclaimerNote());
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = StorageService.subscribe((ev) => {
      if (ev === 'UNIVERSITY_FORMULAS_CHANGED') {
        reloadData();
      }
    });
    return unsub;
  }, []);

  const currentUni: UniversityFormulaProfile | undefined = profiles.find(
    (p) => p.id === selectedUniId
  );

  const availableMajors: UniversityMajor[] = currentUni?.majors || [];
  const currentMajor: UniversityMajor | undefined = availableMajors.find(
    (m) => m.id === selectedMajorId
  );

  const availableMethods: UniversityAdmissionMethod[] = currentMajor?.methods || [];
  const currentMethod: UniversityAdmissionMethod | undefined = availableMethods.find(
    (mt) => mt.id === selectedMethodId
  );

  // When a 3rd-tier Admission Method is chosen, populate default variable values
  useEffect(() => {
    if (currentMethod) {
      const defaults: Record<string, number> = {};
      currentMethod.variables.forEach((v) => {
        defaults[v.key] = v.defaultVal;
      });
      setInputValues(defaults);
    }
  }, [currentMethod?.id]);

  if (!isOpen) return null;

  const handleSelectUni = (uniId: string) => {
    setSelectedUniId(uniId);
    setSelectedMajorId('');
    setSelectedMethodId('');
  };

  const handleSelectMajor = (majorId: string) => {
    setSelectedMajorId(majorId);
    setSelectedMethodId('');
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethodId(methodId);
  };

  const handleQuickFillFirst = () => {
    const firstUni = profiles[0];
    if (!firstUni) return;
    const firstMaj = firstUni.majors?.[0];
    const firstMet = firstMaj?.methods?.[0];
    setSelectedUniId(firstUni.id);
    setSelectedMajorId(firstMaj?.id || '');
    setSelectedMethodId(firstMet?.id || '');
  };

  const handleResetSelection = () => {
    setSelectedUniId('');
    setSelectedMajorId('');
    setSelectedMethodId('');
  };

  const activeFormula = currentMethod?.formulaExpression || currentUni?.formulaExpression || '0';
  const activeBenchmark =
    currentMethod?.benchmarkScore ?? currentUni?.benchmarkScore ?? 0;
  const activeScaleMax = currentMethod?.scaleMax ?? currentUni?.scaleMax ?? 100;
  const activeVariables = currentMethod?.variables || currentUni?.variables || [];
  const activeMethodNote = currentMethod?.note || currentUni?.note || '';

  const evalResult = StorageService.evaluateUniversityFormula(activeFormula, inputValues);
  const diff = Math.round((evalResult.score - activeBenchmark) * 100) / 100;
  const isPass = evalResult.valid && evalResult.score >= activeBenchmark;
  const isAllThreeTiersSelected = Boolean(currentUni && currentMajor && currentMethod);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600/20 via-cyan-600/15 to-emerald-600/20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                🧮 Máy Tính Điểm Xét Tuyển & Tra Cứu Điểm Chuẩn Đại Học
              </h2>
              <p className="text-xs text-slate-300">
                Chọn tuần tự 3 tầng từ trên xuống: Trường Đại Học ➔ Ngành Đào Tạo ➔ Phương Thức Xét Tuyển
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Disclaimer Note Box (Synced with Admin Studio Center 10) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-start gap-3 shadow-inner">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-bold text-amber-200 leading-relaxed">
              {disclaimerNote}
            </p>
          </div>

          {/* SECTION 1: 3-TIER CASCADING DROPDOWN SELECTOR (Trường -> Ngành -> Phương thức) */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-300">
                  1. Chọn Phân Tầng: Trường Đại Học ➔ Ngành Đào Tạo ➔ Phương Thức Xét Tuyển
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isAllThreeTiersSelected && profiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleQuickFillFirst}
                    className="px-3 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 font-bold text-[11px] transition"
                  >
                    ⚡ Xem nhanh mẫu đầu tiên
                  </button>
                )}
                {(selectedUniId || selectedMajorId || selectedMethodId) && (
                  <button
                    type="button"
                    onClick={handleResetSelection}
                    className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Chọn lại từ đầu</span>
                  </button>
                )}
              </div>
            </div>

            {/* ROW 1: TAG TRƯỜNG ĐẠI HỌC (DROPDOWN + TAG PILLS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <GraduationCap className="w-4 h-4" />
                  <span>Dòng 1 — Chọn Tag Trường Đại Học ({profiles.length} trường):</span>
                </label>
                {currentUni && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ Đã chọn: {currentUni.universityCode}
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedUniId}
                  onChange={(e) => handleSelectUni(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-slate-900 border border-cyan-500/40 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer transition"
                >
                  <option value="">-- Nhấn để chọn Tag Trường Đại Học (Bước 1/3) --</option>
                  {profiles.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      🎓 [{prof.universityCode}] {prof.universityTag} ({prof.majors?.length || 0} ngành)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-cyan-300 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Quick clickable University Tags */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profiles.map((prof) => {
                  const active = prof.id === selectedUniId;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => handleSelectUni(prof.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
                        active
                          ? `bg-gradient-to-r ${prof.color || 'from-indigo-600 to-cyan-600'} text-white border-white/40 shadow-md`
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
                      }`}
                    >
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/30">
                        {prof.universityCode}
                      </span>
                      <span>{prof.universityTag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 2: TAG NGÀNH TRƯỜNG ĐẠI HỌC ĐÓ ĐÀO TẠO (DROPDOWN + TAG PILLS) */}
            <div
              className={`space-y-2 pt-3 border-t border-white/10 transition-opacity ${
                currentUni ? 'opacity-100' : 'opacity-50 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-black text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <BookOpen className="w-4 h-4" />
                  <span>
                    Dòng 2 — Chọn Tag Ngành Đào Tạo{' '}
                    {currentUni ? `của ${currentUni.universityTag} (${availableMajors.length} ngành)` : '(Chọn trường trước)'}:
                  </span>
                </label>
                {currentMajor && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ Mã ngành: {currentMajor.code || 'Chuẩn'}
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedMajorId}
                  disabled={!currentUni}
                  onChange={(e) => handleSelectMajor(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-slate-900 border border-indigo-500/40 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer disabled:cursor-not-allowed transition"
                >
                  <option value="">
                    {currentUni
                      ? `-- Nhấn để chọn Tag Ngành Đào Tạo của ${currentUni.universityCode} (Bước 2/3) --`
                      : '-- Vui lòng chọn Tag Trường Đại Học ở Dòng 1 trước --'}
                  </option>
                  {availableMajors.map((maj) => (
                    <option key={maj.id} value={maj.id}>
                      📚 {maj.name} {maj.code ? `(Mã ngành: ${maj.code})` : ''} — {maj.methods.length} phương thức
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-indigo-300 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {currentUni && availableMajors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {availableMajors.map((maj) => {
                    const active = maj.id === selectedMajorId;
                    return (
                      <button
                        key={maj.id}
                        type="button"
                        onClick={() => handleSelectMajor(maj.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-300 shadow-md'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
                        }`}
                      >
                        {maj.code && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-indigo-200">
                            {maj.code}
                          </span>
                        )}
                        <span>{maj.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ROW 3: TAG PHƯƠNG THỨC XÉT TUYỂN (DROPDOWN + TAG PILLS) */}
            <div
              className={`space-y-2 pt-3 border-t border-white/10 transition-opacity ${
                currentMajor ? 'opacity-100' : 'opacity-50 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <Award className="w-4 h-4" />
                  <span>
                    Dòng 3 — Chọn Tag Phương Thức Xét Tuyển{' '}
                    {currentMajor
                      ? `cho ngành ${currentMajor.name} (${availableMethods.length} phương thức)`
                      : '(Chọn ngành trước)'}:
                  </span>
                </label>
                {currentMethod && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ Thang điểm {currentMethod.scaleMax}
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedMethodId}
                  disabled={!currentMajor}
                  onChange={(e) => handleSelectMethod(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-slate-900 border border-amber-500/40 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-amber-400 appearance-none cursor-pointer disabled:cursor-not-allowed transition"
                >
                  <option value="">
                    {currentMajor
                      ? `-- Nhấn để chọn Tag Phương Thức Xét Tuyển (Bước 3/3) --`
                      : '-- Vui lòng chọn Tag Ngành Đào Tạo ở Dòng 2 trước --'}
                  </option>
                  {availableMethods.map((met) => (
                    <option key={met.id} value={met.id}>
                      🎯 {met.name} (Thang {met.scaleMax} — Điểm chuẩn: {met.benchmarkScore})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-amber-300 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {currentMajor && availableMethods.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {availableMethods.map((met) => {
                    const active = met.id === selectedMethodId;
                    return (
                      <button
                        key={met.id}
                        type="button"
                        onClick={() => handleSelectMethod(met.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center gap-1.5 ${
                          active
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-200 shadow-md'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
                        }`}
                      >
                        <span>🎯 {met.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* BENCHMARK SCORE BOX & CALCULATOR (Revealed when all 3 tiers are selected!) */}
          {!isAllThreeTiersSelected ? (
            <div className="p-8 rounded-3xl bg-slate-950/60 border border-dashed border-indigo-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="text-sm font-extrabold text-white">
                Hãy chọn đủ 3 tầng ở trên: Trường Đại Học ➔ Ngành Đào Tạo ➔ Phương Thức Xét Tuyển
              </div>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Ngay sau khi bạn chọn xong cả 3 tầng, hệ thống sẽ mở khóa Ô Điểm Chuẩn chính thức và Bảng tính điểm quy đổi theo đúng công thức của phương thức đó.
              </p>
            </div>
          ) : (
            currentUni &&
            currentMajor &&
            currentMethod && (
              <div className="space-y-5 animate-fade-in">
                {/* Ô HIỂN THỊ ĐIỂM CHUẨN (Sau khi click xong 3 tầng) */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-cyan-950/90 border-2 border-amber-400/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        ✨ Đã chọn đủ 3 tầng
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-[11px]">
                        Mã trường: {currentUni.universityCode}
                      </span>
                      {currentMajor.code && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-[11px]">
                          Mã ngành: {currentMajor.code}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {currentUni.universityTag} — <span className="text-amber-300">{currentMajor.name}</span>
                    </h3>
                    <p className="text-xs text-slate-300 font-semibold">
                      📌 Phương thức xét tuyển: <span className="text-cyan-300">{currentMethod.name}</span>
                    </p>
                  </div>

                  {/* Highlighted Benchmark Box */}
                  <div className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-slate-950/90 border border-amber-400/50 text-center shrink-0 shadow-lg">
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                      ĐIỂM CHUẨN NGÀNH (THANG {activeScaleMax})
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 mt-0.5">
                      {activeBenchmark}{' '}
                      <span className="text-xs font-bold text-slate-400">/ {activeScaleMax}</span>
                    </div>
                  </div>
                </div>

                {/* Score Inputs & Live Calculation Result */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: Dynamic Variables Form */}
                  <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                        2. Nhập Điểm Thành Phần Của Bạn
                      </h3>
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                        CT: {activeFormula}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {activeVariables.map((v) => (
                        <div
                          key={v.key}
                          className="p-3 rounded-xl bg-slate-900/90 border border-white/10"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <label className="font-bold text-slate-200">{v.label}</label>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                              {v.key} (Max {v.max})
                            </span>
                          </div>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max={v.max}
                            value={inputValues[v.key] ?? 0}
                            onChange={(e) =>
                              setInputValues((prev) => ({
                                ...prev,
                                [v.key]: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono font-bold text-sm border border-white/10"
                          />
                        </div>
                      ))}
                    </div>

                    {activeMethodNote && (
                      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{activeMethodNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Calculated Result & Benchmark Comparison */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 flex flex-col justify-between gap-4 text-center">
                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-slate-300">
                        ĐIỂM CỦA BẠN (THANG {activeScaleMax})
                      </span>
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 py-2 font-mono">
                        {evalResult.valid ? evalResult.score.toFixed(2) : 'Lỗi CT'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Điểm chuẩn ngành <strong className="text-slate-200">{currentMajor.name}</strong>:{' '}
                        <strong className="text-amber-300 font-mono">{activeBenchmark}</strong> /{' '}
                        {activeScaleMax}
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border text-left space-y-1.5 ${
                        isPass
                          ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                          : 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black text-sm">
                        {isPass ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>🎉 ĐẠT & VƯỢT ĐIỂM CHUẨN!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                            <span>💪 CẦN BỨT PHÁ THÊM!</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed">
                        {isPass
                          ? `Điểm của bạn đang cao hơn điểm chuẩn ngành ${currentMajor.name} là +${diff.toFixed(2)} điểm. Hãy giữ vững phong độ nhé!`
                          : `Bạn còn thiếu ${Math.abs(diff).toFixed(2)} điểm nữa để chạm mốc điểm chuẩn ngành ${currentMajor.name} (${currentUni.universityCode}).`}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dữ liệu Trường • Ngành • Điểm chuẩn đồng bộ từ Admin Studio</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
