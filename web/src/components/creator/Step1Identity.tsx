'use client';

import { useState } from 'react';
import {
  useCreatorStore,
  AVATAR_OPTIONS,
  CATEGORIES,
  SUGGESTED_TAGS,
} from '@/lib/creatorStore';

export function Step1Identity() {
  const { draft, setDraft } = useCreatorStore();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const suggestedTags = draft.category ? SUGGESTED_TAGS[draft.category] || [] : [];

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalizedTag && !draft.tags.includes(normalizedTag) && draft.tags.length < 5) {
      setDraft({ tags: [...draft.tags, normalizedTag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setDraft({ tags: draft.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="space-y-6">
      {/* Avatar Selection */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          className="w-24 h-24 avatar avatar-lg text-4xl mb-2 transition-transform hover:scale-105"
        >
          {draft.avatar}
        </button>
        <button
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          className="text-[13px] font-medium transition-colors"
          style={{ color: 'var(--cta-start)' }}
        >
          Change Avatar
        </button>

        {showAvatarPicker && (
          <div className="mt-4 card p-4">
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => {
                    setDraft({ avatar });
                    setShowAvatarPicker(false);
                  }}
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-xl transition-all ${
                    draft.avatar === avatar
                      ? ''
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: draft.avatar === avatar ? 'var(--sage)' : 'var(--surface)',
                    border: `1px solid ${draft.avatar === avatar ? 'var(--cta-start)' : 'var(--border)'}`,
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Coach Name <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Productivity Pro, Mindset Maven"
          value={draft.name}
          onChange={(e) => setDraft({ name: e.target.value })}
          maxLength={30}
        />
        <p className="meta-text mt-1">
          {draft.name.length}/30 characters
        </p>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Tagline <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="A short description of what your coach does"
          value={draft.tagline}
          onChange={(e) => setDraft({ tagline: e.target.value })}
          maxLength={100}
        />
        <p className="meta-text mt-1">
          {draft.tagline.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Description
        </label>
        <textarea
          className="input min-h-[100px]"
          placeholder="Describe your coach in more detail. What makes it unique? Who is it for?"
          value={draft.description}
          onChange={(e) => setDraft({ description: e.target.value })}
          maxLength={500}
        />
        <p className="meta-text mt-1">
          {draft.description.length}/500 characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Category <span style={{ color: 'var(--error)' }}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setDraft({ category: category.id, tags: [] })}
              className={`chip ${draft.category === category.id ? 'chip-selected' : ''}`}
            >
              {category.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Tags (up to 5)
        </label>

        {/* Selected tags */}
        {draft.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {draft.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => removeTag(tag)}
                className="chip chip-sage flex items-center gap-1"
              >
                #{tag}
                <span style={{ color: 'var(--text-placeholder)' }}>×</span>
              </button>
            ))}
          </div>
        )}

        {/* Tag input */}
        {draft.tags.length < 5 && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="input flex-1"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
            />
            <button
              onClick={() => addTag(tagInput)}
              className="btn btn-secondary"
            >
              Add
            </button>
          </div>
        )}

        {/* Suggested tags */}
        {draft.category && suggestedTags.length > 0 && (
          <div>
            <p className="meta-text mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags
                .filter((tag) => !draft.tags.includes(tag))
                .slice(0, 6)
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="chip"
                  >
                    #{tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
