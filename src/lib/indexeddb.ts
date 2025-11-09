import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VideoEditorDB extends DBSchema {
  clips: {
    key: string;
    value: {
      id: string;
      file: File;
      thumbnail: string;
      duration: number;
      startTime: number;
      trimStart: number;
      trimEnd: number;
      filters: {
        brightness: number;
        contrast: number;
        saturation: number;
      };
      timestamp: number;
    };
  };
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      clipIds: string[];
      musicFile?: File;
      textOverlays: Array<{
        text: string;
        timestamp: number;
        duration: number;
        style: any;
      }>;
      lastModified: number;
    };
  };
  music: {
    key: string;
    value: {
      id: string;
      file: File;
      waveformData: number[];
      beats: number[];
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<VideoEditorDB> | null = null;

export const initDB = async () => {
  if (db) return db;

  db = await openDB<VideoEditorDB>('video-editor', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('clips')) {
        db.createObjectStore('clips', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('music')) {
        db.createObjectStore('music', { keyPath: 'id' });
      }
    },
  });

  return db;
};

export const saveClip = async (clip: VideoEditorDB['clips']['value']) => {
  const database = await initDB();
  await database.put('clips', clip);
};

export const getClip = async (id: string) => {
  const database = await initDB();
  return database.get('clips', id);
};

export const getAllClips = async () => {
  const database = await initDB();
  return database.getAll('clips');
};

export const deleteClip = async (id: string) => {
  const database = await initDB();
  await database.delete('clips', id);
};

export const saveProject = async (project: VideoEditorDB['projects']['value']) => {
  const database = await initDB();
  await database.put('projects', project);
};

export const getProject = async (id: string) => {
  const database = await initDB();
  return database.get('projects', id);
};

export const getAllProjects = async () => {
  const database = await initDB();
  return database.getAll('projects');
};

export const saveMusic = async (music: VideoEditorDB['music']['value']) => {
  const database = await initDB();
  await database.put('music', music);
};

export const getMusic = async (id: string) => {
  const database = await initDB();
  return database.get('music', id);
};

export const clearAllData = async () => {
  const database = await initDB();
  await database.clear('clips');
  await database.clear('projects');
  await database.clear('music');
};
