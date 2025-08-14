import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const FILES_URL = Constants.expoConfig?.extra?.filesUrl;

const ProjectInvitationCard = ({
    invitation,
    type = 'received', // 'received' or 'sent'
    onAccept,
    onDecline,
    onCancel,
    isLoading = false,
}) => {
    const project = invitation.project;
    const user = type === 'received' ? invitation.inviter : invitation.user;

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return '#6B7280';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const renderAvatar = (user, size = 32) => (
        <View
            style={[
                styles.avatar,
                { width: size, height: size, borderRadius: size / 2 },
            ]}
        >
            {user?.profile_picture ? (
                <Image
                    source={{ uri: `${FILES_URL}${user.profile_picture}` }}
                    style={[
                        styles.avatarImage,
                        { width: size, height: size, borderRadius: size / 2 },
                    ]}
                />
            ) : (
                <Ionicons name="person" size={size * 0.6} color="#9CA3AF" />
            )}
        </View>
    );

    return (
        <View style={styles.card}>
            {/* Project Header */}
            <View style={styles.projectHeader}>
                <View style={styles.projectIcon}>
                    <View style={[
                        styles.projectIconBackground,
                        { backgroundColor: getPriorityColor(project.priority) + '20' }
                    ]}>
                        <Ionicons name="folder" size={20} color={getPriorityColor(project.priority)} />
                    </View>
                </View>
                <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View style={styles.projectMeta}>
                        <View style={[
                            styles.priorityBadge,
                            { backgroundColor: getPriorityColor(project.priority) + '20' }
                        ]}>
                            <View style={[
                                styles.priorityDot,
                                { backgroundColor: getPriorityColor(project.priority) }
                            ]} />
                            <Text style={[
                                styles.priorityText,
                                { color: getPriorityColor(project.priority) }
                            ]}>
                                {project.priority || 'Low'}
                            </Text>
                        </View>
                        <Text style={styles.timeText}>{formatDate(invitation.invited_at)}</Text>
                    </View>
                </View>
            </View>

            {/* Project Description */}
            {project.description && (
                <Text style={styles.projectDescription} numberOfLines={2}>
                    {project.description}
                </Text>
            )}

            {/* User Info */}
            <View style={styles.userSection}>
                <View style={styles.userInfo}>
                    {renderAvatar(user, 32)}
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                            {type === 'received' ? `Invited by ${user?.full_name}` : `Sent to ${user?.full_name}`}
                        </Text>
                        <Text style={styles.userRole}>
                            {type === 'received' ? 'Project Owner' : 'Awaiting response'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            {type === 'received' ? (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton, isLoading && styles.actionButtonDisabled]}
                        onPress={onDecline}
                        disabled={isLoading}
                    >
                        <Ionicons name="close" size={16} color="#EF4444" />
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton, isLoading && styles.actionButtonDisabled]}
                        onPress={onAccept}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={16} color="#fff" />
                                <Text style={styles.acceptButtonText}>Accept</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.cancelButtonContainer}>
                    <TouchableOpacity
                        style={[styles.cancelButton, isLoading && styles.actionButtonDisabled]}
                        onPress={onCancel}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                <Ionicons name="close-circle" size={16} color="#EF4444" />
                                <Text style={styles.cancelButtonText}>Cancel Invitation</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    projectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    projectIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
    },
    projectIconBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    projectMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 12,
    },
    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '500',
    },
    timeText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    projectDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    userSection: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 2,
    },
    userRole: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minHeight: 44,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    acceptButton: {
        backgroundColor: '#10B981',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    declineButton: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    declineButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    cancelButtonContainer: {
        alignItems: 'center',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    avatar: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        resizeMode: 'cover',
    },
});

export default ProjectInvitationCard;