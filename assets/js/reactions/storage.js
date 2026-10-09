/**
 * Pluggable Reaction Storage Adapters
 * Supports:
 * - LocalStorage (default, zero-config, works offline and on GitHub Pages)
 * - Supabase (REST/RPC with anonymous key)
 * - Custom REST API / Cloudflare Worker / Serverless
 */

const LOCAL_USER_KEY = 'myblog.reactions.user';
const LOCAL_COUNTS_KEY = 'myblog.reactions.counts';

export const EMOJI_IDS = ['like', 'love', 'insightful', 'rocket', 'mindblown'];

function cleanString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/^["']|["']$/g, '').trim();
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateSeedCounts(postId) {
  const h = hashString(postId || 'default-post');
  return {
    like: 4 + (h % 11),
    love: 2 + ((h >> 2) % 9),
    insightful: 1 + ((h >> 4) % 7),
    rocket: 2 + ((h >> 6) % 8),
    mindblown: 1 + ((h >> 8) % 5)
  };
}

class LocalAdapter {
  constructor(options = {}) {
    this.seedInitial = options.seedInitialCounts === true;
  }

  getUserReactions(postId) {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return Array.isArray(data[postId]) ? data[postId] : [];
    } catch (e) {
      console.warn('Reactions: error reading user reactions from localStorage', e);
      return [];
    }
  }

  saveUserReactions(postId, userList) {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      const data = raw ? JSON.parse(raw) : {};
      data[postId] = userList;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Reactions: error saving user reactions to localStorage', e);
    }
  }

  getCounts(postId) {
    try {
      const raw = localStorage.getItem(LOCAL_COUNTS_KEY);
      const data = raw ? JSON.parse(raw) : {};
      if (!data[postId]) {
        data[postId] = this.seedInitial ? generateSeedCounts(postId) : {
          like: 0, love: 0, insightful: 0, rocket: 0, mindblown: 0
        };
        localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(data));
      }
      return { ...data[postId] };
    } catch (e) {
      console.warn('Reactions: error getting counts from localStorage', e);
      return this.seedInitial ? generateSeedCounts(postId) : {
        like: 0, love: 0, insightful: 0, rocket: 0, mindblown: 0
      };
    }
  }

  saveCounts(postId, counts) {
    try {
      const raw = localStorage.getItem(LOCAL_COUNTS_KEY);
      const data = raw ? JSON.parse(raw) : {};
      data[postId] = counts;
      localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Reactions: error saving counts to localStorage', e);
    }
  }

  async fetch(postId) {
    return {
      counts: this.getCounts(postId),
      userReactions: this.getUserReactions(postId)
    };
  }

  async toggle(postId, emojiId) {
    const userList = this.getUserReactions(postId);
    const counts = this.getCounts(postId);
    const alreadyReacted = userList.includes(emojiId);

    let updatedUserList;
    if (alreadyReacted) {
      updatedUserList = userList.filter(id => id !== emojiId);
      counts[emojiId] = Math.max(0, (counts[emojiId] || 1) - 1);
    } else {
      updatedUserList = [...userList, emojiId];
      counts[emojiId] = (counts[emojiId] || 0) + 1;
    }

    this.saveUserReactions(postId, updatedUserList);
    this.saveCounts(postId, counts);

    return {
      added: !alreadyReacted,
      counts,
      userReactions: updatedUserList
    };
  }
}

class SupabaseAdapter {
  constructor(options = {}, localFallback) {
    this.url = cleanString(options.supabaseUrl || options.supabaseurl || '').replace(/\/+$/, '');
    this.key = cleanString(options.supabaseKey || options.supabasekey || '');
    this.local = localFallback;
    this.cachedCounts = {};
  }

  getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    };
  }

  async fetch(postId) {
    const userReactions = this.local.getUserReactions(postId);
    const counts = { like: 0, love: 0, insightful: 0, rocket: 0, mindblown: 0 };

    try {
      const endpoint = `${this.url}/rest/v1/reactions?post_id=eq.${encodeURIComponent(postId)}&select=emoji,count`;
      const res = await fetch(endpoint, {
        headers: this.getHeaders(),
        mode: 'cors'
      });
      if (!res.ok) {
        throw new Error(`Supabase returned status ${res.status}`);
      }
      const rows = await res.json();
      
      rows.forEach(r => {
        if (r.emoji && typeof r.count === 'number') {
          counts[r.emoji] = r.count;
        }
      });

      this.cachedCounts[postId] = { ...counts };
      return { counts, userReactions };
    } catch (err) {
      console.warn('Reactions: Supabase fetch error, using local state', err);
      // Fall back to memory cache or zero counts
      const fallbackCounts = this.cachedCounts[postId] || counts;
      return { counts: fallbackCounts, userReactions };
    }
  }

  async toggle(postId, emojiId) {
    const userList = this.local.getUserReactions(postId);
    const alreadyReacted = userList.includes(emojiId);
    const delta = alreadyReacted ? -1 : 1;

    const updatedUserList = alreadyReacted
      ? userList.filter(id => id !== emojiId)
      : [...userList, emojiId];
    this.local.saveUserReactions(postId, updatedUserList);

    const counts = this.cachedCounts[postId] || {
      like: 0, love: 0, insightful: 0, rocket: 0, mindblown: 0
    };
    counts[emojiId] = Math.max(0, (counts[emojiId] || 0) + delta);
    this.cachedCounts[postId] = counts;

    // Call Supabase RPC to update database globally
    try {
      const endpoint = `${this.url}/rest/v1/rpc/increment_reaction`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          p_post_id: postId,
          p_emoji: emojiId,
          p_delta: delta
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Reactions: Supabase RPC returned error:', res.status, errorText);
      }
    } catch (e) {
      console.error('Reactions: Supabase RPC network error:', e);
    }

    return {
      added: !alreadyReacted,
      counts,
      userReactions: updatedUserList
    };
  }
}

class ApiAdapter {
  constructor(options = {}, localFallback) {
    this.endpoint = cleanString(options.apiEndpoint || options.apiendpoint || '').replace(/\/+$/, '');
    this.local = localFallback;
    this.cachedCounts = {};
  }

  async fetch(postId) {
    const userReactions = this.local.getUserReactions(postId);
    const counts = { like: 0, love: 0, insightful: 0, rocket: 0, mindblown: 0 };
    try {
      const res = await fetch(`${this.endpoint}?post_id=${encodeURIComponent(postId)}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      Object.assign(counts, data.counts || {});
      this.cachedCounts[postId] = { ...counts };
      return { counts, userReactions };
    } catch (err) {
      console.warn('Reactions: API fetch error, using local fallback', err);
      const fallbackCounts = this.cachedCounts[postId] || counts;
      return { counts: fallbackCounts, userReactions };
    }
  }

  async toggle(postId, emojiId) {
    const userList = this.local.getUserReactions(postId);
    const alreadyReacted = userList.includes(emojiId);
    const delta = alreadyReacted ? -1 : 1;

    const updatedUserList = alreadyReacted
      ? userList.filter(id => id !== emojiId)
      : [...userList, emojiId];
    this.local.saveUserReactions(postId, updatedUserList);

    const counts = this.cachedCounts[postId] || {
      like: 0, love: 0, insightful: 0, rocket: 0, mindblown: 0
    };
    counts[emojiId] = Math.max(0, (counts[emojiId] || 0) + delta);
    this.cachedCounts[postId] = counts;

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          emoji: emojiId,
          delta
        })
      });
    } catch (e) {
      console.warn('Reactions: API sync error, retained locally.', e);
    }

    return {
      added: !alreadyReacted,
      counts,
      userReactions: updatedUserList
    };
  }
}

export function createStorage(options = {}) {
  const provider = cleanString(options.provider || 'local').toLowerCase();
  const supabaseUrl = cleanString(options.supabaseUrl || options.supabaseurl || '');
  const supabaseKey = cleanString(options.supabaseKey || options.supabasekey || '');
  const apiEndpoint = cleanString(options.apiEndpoint || options.apiendpoint || '');
  const seedInitialCounts = (options.seedInitialCounts !== undefined)
    ? options.seedInitialCounts
    : (options.seedinitialcounts !== undefined ? options.seedinitialcounts : false);

  const normalizedOptions = {
    ...options,
    provider,
    supabaseUrl,
    supabaseKey,
    apiEndpoint,
    seedInitialCounts
  };

  const local = new LocalAdapter(normalizedOptions);

  if (provider === 'supabase' && supabaseUrl && supabaseKey) {
    return new SupabaseAdapter(normalizedOptions, local);
  }
  if (provider === 'api' && apiEndpoint) {
    return new ApiAdapter(normalizedOptions, local);
  }
  return local;
}
