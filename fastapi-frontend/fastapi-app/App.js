import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.9:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🔹 ADDED FOR UPDATE
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch posts');
      console.error(error);
    }
  };

  const createPost = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }

    try {
      await axios.post(`${API_URL}/posts`, {
        title,
        content,
        published,
      });
      Alert.alert('Success', 'Post created successfully');
      setTitle('');
      setContent('');
      setPublished(true);
      fetchPosts();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
      console.error(error);
    }
  };

  // 🔹 UPDATE POST FUNCTION
  const updatePost = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }

    try {
      await axios.put(`${API_URL}/posts/${editingPostId}`, {
        title,
        content,
        published,
      });

      Alert.alert('Success', 'Post updated successfully');

      setTitle('');
      setContent('');
      setPublished(true);
      setIsEditing(false);
      setEditingPostId(null);

      fetchPosts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update post');
      console.error(error);
    }
  };

  const deletePost = async (id) => {
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      Alert.alert('Success', 'Post deleted');
      fetchPosts();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post');
      console.error(error);
    }
  };

  // 🔹 START EDIT MODE
  const startEdit = (post) => {
    setIsEditing(true);
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPublished(post.published);
  };

  const createUser = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users`, {
        email,
        password,
      });
      Alert.alert('Success', 'User created successfully');
      setEmail('');
      setPassword('');
      setUsers([...users, response.data]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create user (email might be taken)');
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postMeta}>
        {item.published ? '✓ Published' : '✗ Draft'} • {new Date(item.created_at).toLocaleDateString()}
      </Text>

      {/* 🔹 EDIT BUTTON */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#22c55e', marginBottom: 8 }]}
        onPress={() => startEdit(item)}
      >
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deletePost(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FastAPI App</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'posts' && (
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Content"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setPublished(!published)}
            >
              <Text>{published ? '✓' : '○'} Published</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={isEditing ? updatePost : createPost}
            >
              <Text style={styles.buttonText}>
                {isEditing ? 'Update Post' : 'Create Post'}
              </Text>
            </TouchableOpacity>

            {/* 🔹 CANCEL EDIT */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#6b7280', marginTop: 10 }]}
                onPress={() => {
                  setIsEditing(false);
                  setEditingPostId(null);
                  setTitle('');
                  setContent('');
                  setPublished(true);
                }}
              >
                <Text style={styles.buttonText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>All Posts</Text>

          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      {activeTab === 'users' && (
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create New User</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={createUser}>
              <Text style={styles.buttonText}>Create User</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Created Users</Text>

          {users.map((user) => (
            <View key={user.id} style={styles.postCard}>
              <Text style={styles.postTitle}>{user.email}</Text>
              <Text style={styles.postMeta}>
                Created: {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkbox: {
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  postMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
