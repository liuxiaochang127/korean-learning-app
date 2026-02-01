
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, FileAudio, FileText, X, Check, Loader2, Trash2, Play, Pause, Eye } from 'lucide-react';

interface UploadedFile {
  name: string;
  id: string; // or path
  created_at: string;
  metadata: {
    mimetype: string;
    size: number;
  };
}

const ResourceUploadView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // 带进度的音频状态
  // Removed here, moved lower (see toggleAudio section update) to keep grouped with logic.
  // Ideally we should keep them here but the previous edit tool replaced the block starting at toggleAudio 
  // and included the state definitions there. So we remove them from here to avoid duplicate identifiers.
  // EDIT: Actually, the previous 'replace' block replaced toggleAudio AND injected the state variables there?
  // Let's check the previous tool output. 
  // It seems I'm replacing the toggleAudio block with state variables above it.
  // Wait, the previous tool call REPLACED lines 223-255 with new state variables + new toggleAudio.
  // So lines 24-27 (the old state variables) are now DUPLICATES. We must remove them.

  // 加载已上传文件列表
  useEffect(() => {
    fetchFiles();
  }, []);

  // 5秒后自动隐藏错误/成功消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase
      .storage
      .from('resources')
      .list('uploads', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error loading files:', error);
    } else {
      setFileList(data || []);
    }
    setLoadingFiles(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: '请先选择一个文件。' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 策略：对文件名进行 Base64 编码以确保其纯 ASCII（A-Z, a-z, 0-9, -, _）
      // 这避免了特殊字符/中文字符的任何 S3 "Invalid Key" 问题，同时保留了原始名称数据。
      // 格式：timestamp__BASE64NAME

      const encoder = (str: string) => {
        // UTF-8 友好的 Base64 编码
        return window.btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, ''); // 移除填充以保持整洁
      };

      const base64Name = encoder(file.name);
      // 使用双下划线作为分隔符，以便稍后轻松分割
      const storageName = `${Date.now()}__${base64Name}`;
      const filePath = `uploads/${storageName}`;

      // 模拟进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.storage
        .from('resources')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        });

      clearInterval(progressInterval);

      if (error) {
        // 翻译常见的 Supabase 错误
        if (error.message.includes('row-level security')) {
          throw new Error('权限不足: 请在 Supabase 后台 Storage -> Policies 开启 "Insert" 权限。');
        } else if (error.message.includes('Duplicate')) {
          throw new Error('文件已存在，请重命名后上传。');
        } else {
          throw error;
        }
      }

      setUploadProgress(100);
      setMessage({ type: 'success', text: '文件上传成功！' });
      setFile(null);
      fetchFiles(); // 刷新列表

    } catch (error: any) {
      console.error('Upload error:', error);
      // 构造更有帮助的错误消息
      let errorMsg = error.message || '上传失败';
      if (error.statusCode) {
        errorMsg += ` (代码: ${error.statusCode})`;
      }
      if (error.error) {
        errorMsg += ` [${error.error}]`;
      }
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm('确定要删除这个文件吗？此操作无法撤销。')) return;

    try {
      const { data, error } = await supabase.storage
        .from('resources')
        .remove([`uploads/${fileName}`]);

      if (error) {
        throw error;
      }

      // 如果未删除任何文件（例如权限问题或文件未找到），Supabase 返回空数组
      if (!data || data.length === 0) {
        throw new Error('删除操作未执行：可能是权限不足（Policy）或文件不存在。');
      }

      setMessage({ type: 'success', text: '文件删除成功' });
      // 刷新列表
      fetchFiles();
    } catch (error: any) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: error.message || '删除失败，请检查网络或权限。' });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取公共 URL 的辅助函数
  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage.from('resources').getPublicUrl(`uploads/${fileName}`);
    return data.publicUrl;
  };

  // 提取显示名称（如果匹配模式则解码 Base64，否则回退）
  const getDisplayName = (fileName: string) => {
    // 检查是否匹配我们的模式：timestamp__BASE64
    if (fileName.includes('__')) {
      const parts = fileName.split('__');
      if (parts.length === 2) {
        try {
          let b64 = parts[1];
          // 恢复 Base64 字符
          b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
          // 用 = 填充
          while (b64.length % 4) b64 += '=';
          // 解码 UTF-8
          return decodeURIComponent(escape(window.atob(b64)));
        } catch (e) {
          // 如果解码失败，返回原始值
          return fileName;
        }
      }
    }

    // 旧文件或简单名称的回退
    // 1. 移除时间戳前缀
    const nameWithoutPrefix = fileName.replace(/^\d+_/, '');
    // 2. 解码 URL 实体以恢复中文
    try {
      return decodeURIComponent(nameWithoutPrefix);
    } catch (e) {
      return nameWithoutPrefix;
    }
  };

  // 带进度的音频状态
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = (fileName: string) => {
    const url = getFileUrl(fileName);

    if (currentAudio === url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else if (currentAudio === url && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // 重置之前的
      }
      const audio = new Audio(url);

      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audio.onerror = () => {
        setMessage({ type: 'error', text: "无法播放音频，可能文件损坏或格式不支持。" });
        setIsPlaying(false);
      };

      audioRef.current = audio;
      audio.play().catch(e => console.error(e));
      setCurrentAudio(url);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePreview = (fileName: string) => {
    const url = getFileUrl(fileName);
    // 对于图片/PDF，在新标签页中打开。
    // 对于 .docx，使用 Microsoft Office Online Viewer 或 Google Docs Viewer 回退
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc') || lowerName.endsWith('.pptx') || lowerName.endsWith('.xlsx')) {
      // 使用 Office Online Viewer
      const encodedUrl = encodeURIComponent(url);
      window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">资源上传中心</h1>
        <p className="text-gray-500 text-sm">上传音频或文档资料，丰富您的学习库。</p>
      </header>

      {/* 上传卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-primary/30'
            }`}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept="audio/*,application/pdf,text/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />

          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
            {file ? (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {file.type.startsWith('audio') ? <FileAudio className="text-primary" /> : <FileText className="text-primary" />}
                </div>
                <p className="text-sm font-medium text-gray-700 text-center break-all">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{formatSize(file.size)}</p>
                <button
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="mt-4 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={14} /> 移除文件
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Upload className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">点击选择上传文件</p>
                <p className="text-xs text-gray-400 mt-1">支持格式：音频 (MP3, WAV) 或 文档 (PDF, Word)</p>
              </>
            )}
          </label>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">正在上传... {uploadProgress}%</p>
          </div>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 animate-slide-up ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {message.text}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`flex items-center justify-center gap-2 w-full mt-6 py-3 rounded-xl font-medium transition-all ${!file || uploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/30'
            }`}
        >
          {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          {uploading ? '上传中...' : '开始上传'}
        </button>
      </div>

      {/* 文件列表 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 px-1">我的资源列表</h2>

        {loadingFiles ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
        ) : fileList.length === 0 ? (
          <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            暂无上传文件。
          </div>
        ) : (
          <div className="grid gap-3">
            {fileList.map((f) => {
              const isAudio = f.metadata?.mimetype?.startsWith('audio') || f.name.endsWith('.mp3') || f.name.endsWith('.wav');
              const isPlayingThis = isPlaying && currentAudio === getFileUrl(f.name);
              const displayName = getDisplayName(f.name);

              return (
                <div key={f.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow ${isPlayingThis ? 'ring-1 ring-primary/30' : ''}`}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                      <button
                        onClick={() => isAudio ? toggleAudio(f.name) : handlePreview(f.name)}
                        className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${isAudio
                          ? (isPlayingThis ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20')
                          : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                          }`}
                      >
                        {isAudio ? (isPlayingThis ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />) : <FileText size={20} />}
                      </button>

                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => isAudio ? toggleAudio(f.name) : handlePreview(f.name)}>
                        <p className={`text-sm font-medium truncate ${isPlayingThis ? 'text-primary' : 'text-gray-800'}`}>
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          {new Date(f.created_at).toLocaleDateString()} • {formatSize(f.metadata?.size)}
                          {!isAudio && <span className="text-blue-400 flex items-center gap-0.5"><Eye size={10} /> 预览</span>}
                        </p>
                      </div>
                    </div>

                    <button onClick={() => handleDelete(f.name)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                  </div>

                  {/* 音频进度条（仅在播放此文件时可见） */}
                  {isPlayingThis && (
                    <div className="px-4 pb-4 -mt-1 animate-slide-up">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-gray-400 font-mono w-8 text-right">{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm"
                        />
                        <span className="text-[10px] text-gray-400 font-mono w-8">{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceUploadView;
