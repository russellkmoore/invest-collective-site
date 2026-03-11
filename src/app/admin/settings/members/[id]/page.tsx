'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Trash2, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { updateMember, updateMemberStatus, addMemberNote, deleteMember } from '../actions';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  years_investing: string;
  trading_style: string;
  areas_of_expertise: string;
  macro_knowledge: string;
  portfolio_size: string;
  investment_journey: string;
  expectations: string;
  referral_source: string | null;
  status: 'pending' | 'approved' | 'active';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params?.id as string);

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/v1/members/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMember(data.member);
        } else {
          setMessage({ type: 'error', text: 'Failed to load member' });
        }
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load member' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append('id', member.id.toString());

    const result = await updateMember(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Member updated successfully' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update member' });
    }

    setSaving(false);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'approved' | 'active') => {
    if (!member) return;

    setSaving(true);
    setMessage(null);

    const result = await updateMemberStatus(member.id, newStatus, 'Admin'); // TODO: Get actual admin name

    if (result.success) {
      setMember({ ...member, status: newStatus });
      setMessage({ type: 'success', text: `Status updated to ${newStatus}` });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update status' });
    }

    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!member || !newNote.trim()) return;

    setAddingNote(true);
    const result = await addMemberNote(member.id, newNote);

    if (result.success) {
      // Refresh member data
      const response = await fetch(`/api/v1/members/${id}`);
      const data = await response.json();
      if (data.success) {
        setMember(data.member);
      }
      setNewNote('');
      setMessage({ type: 'success', text: 'Note added successfully' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to add note' });
    }

    setAddingNote(false);
  };

  const handleDelete = async () => {
    if (!member) return;

    const result = await deleteMember(member.id);

    if (result.success) {
      router.push('/admin/settings/members');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete member' });
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Loading member details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Member not found</p>
            <Link href="/admin/settings/members" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
              ← Back to Members
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: UserCheck },
    };
    const config = styles[status as keyof typeof styles] || styles.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/settings/members"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Members</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-600 mt-1">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(member.status)}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete member"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</p>
          </div>
        )}

        {/* Status Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Workflow</h2>
          <div className="flex items-center gap-3">
            {member.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Application
              </button>
            )}
            {member.status === 'approved' && (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                <UserCheck className="w-4 h-4" />
                Activate Member
              </button>
            )}
            {member.status === 'active' && (
              <p className="text-green-700 font-medium flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Active Member
              </p>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={member.name}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={member.email}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={member.phone}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Investment Background */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Investment Background</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years Investing</label>
                  <select
                    name="years_investing"
                    defaultValue={member.years_investing}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="less-than-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10-plus">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trading Style</label>
                  <select
                    name="trading_style"
                    defaultValue={member.trading_style}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="day-trading">Day Trading</option>
                    <option value="swing-trading">Swing Trading</option>
                    <option value="long-term">Long-term Investing</option>
                    <option value="value-investing">Value Investing</option>
                    <option value="growth-investing">Growth Investing</option>
                    <option value="options-trading">Options Trading</option>
                    <option value="mixed">Mixed Approach</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Macro Knowledge</label>
                  <select
                    name="macro_knowledge"
                    defaultValue={member.macro_knowledge}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Size</label>
                  <select
                    name="portfolio_size"
                    defaultValue={member.portfolio_size}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="under-10k">Under $10,000</option>
                    <option value="10k-50k">$10,000 - $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-500k">$250,000 - $500,000</option>
                    <option value="500k-plus">$500,000+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                <textarea
                  name="areas_of_expertise"
                  defaultValue={member.areas_of_expertise}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Application Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Application</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Journey</label>
                <textarea
                  name="investment_journey"
                  defaultValue={member.investment_journey}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expectations & Contributions</label>
                <textarea
                  name="expectations"
                  defaultValue={member.expectations}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                <input
                  type="text"
                  name="referral_source"
                  defaultValue={member.referral_source || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Admin Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notes</h2>

          {/* Existing Notes */}
          {member.admin_notes ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 whitespace-pre-wrap text-sm text-gray-700">
              {member.admin_notes}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">No notes yet</p>
          )}

          {/* Add Note */}
          <div className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this member..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
            >
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Applied:</span>{' '}
              {new Date(member.created_at).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
            {member.reviewed_at && (
              <div>
                <span className="font-medium">Reviewed:</span>{' '}
                {new Date(member.reviewed_at).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                {member.reviewed_by && `by ${member.reviewed_by}`}
              </div>
            )}
            {member.approved_at && (
              <div>
                <span className="font-medium">Approved:</span>{' '}
                {new Date(member.approved_at).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            )}
            {member.activated_at && (
              <div>
                <span className="font-medium">Activated:</span>{' '}
                {new Date(member.activated_at).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Member?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {member.name}? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
