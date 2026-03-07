import React, { useState, useEffect, useRef } from "react";
import PostCard from "../../components/forum/PostCard";
import CreatePostModal from "../../components/forum/CreatePostModal";
import Filters from "../../components/forum/Filters";
import FeaturedTopics from "../../components/forum/FeaturedTopics";
import MessageModal from "../../components/forum/MessageModal";
// import EditPostModal from '../../components/forum/EditPostModal'
import UserProfileModal from "../../components/forum/UserProfileModal";
import PostDetailModal from "../../components/forum/PostDetailModal";
import EditPostModal from "../../components/forum/EditPostModal";
import forumService from "../../services/forumService";
import authService from "../../services/authService";
import { useUser } from "../../context/UserContext";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  PenSquare,
  Sparkles,
  TrendingUp,
  Users,
  FileX,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Mock data
// const initialPosts = [
//   {
//     id: 1,
//     author: {
//       name: "Nguyễn Văn A",
//       role: "Nghiên cứu viên",
//       avatar: "NVA",
//       bio: "Chuyên gia về bảo tồn di sản văn hóa Việt Nam",
//       posts: 12,
//       joined: "Tháng 1, 2024",
//     },
//     title: "Vai trò của công nghệ trong bảo tồn di sản",
//     content:
//       "Công nghệ số đang mở ra nhiều cơ hội mới cho việc bảo tồn và phát huy giá trị di sản văn hóa. Các công nghệ như VR, AR, và AI đang được ứng dụng rộng rãi trong việc tái hiện và bảo quản các di sản.",
//     category: "Công nghệ",
//     likes: 24,
//     dislikes: 2,
//     comments: [],
//     timestamp: "2 giờ trước",
//     tags: ["Công nghệ", "Di sản", "VR/AR"],
//     images: [], // Thêm field images
//   },
//   {
//     id: 2,
//     author: {
//       name: "Trần Thị B",
//       role: "Sinh viên",
//       avatar: "TTB",
//       bio: "Đam mê lịch sử và văn hóa Việt Nam",
//       posts: 8,
//       joined: "Tháng 3, 2024",
//     },
//     title: "Kinh nghiệm tham quan Cố đô Huế",
//     content:
//       "Mình vừa có chuyến tham quan Cố đô Huế và thực sự ấn tượng với vẻ đẹp kiến trúc cổ kính. Các bạn có ai đã từng đến đây chưa? Chia sẻ trải nghiệm nhé!",
//     category: "Du lịch",
//     likes: 15,
//     dislikes: 0,
//     comments: [],
//     timestamp: "5 giờ trước",
//     tags: ["Du lịch", "Huế", "Di sản"],
//     images: [], // Thêm field images
//   },
//   {
//     id: 3,
//     author: {
//       name: "Lê Văn C",
//       role: "Giảng viên",
//       avatar: "LVC",
//       bio: "Giảng viên khoa Lịch sử - ĐHKHXH&NV",
//       posts: 45,
//       joined: "Tháng 6, 2023",
//     },
//     title: "Thảo luận: Làm thế nào để giới trẻ quan tâm hơn đến lịch sử?",
//     content:
//       "Trong thời đại số hóa, việc thu hút giới trẻ quan tâm đến lịch sử là một thách thức. Các bạn nghĩ gì về việc sử dụng game, mạng xã hội để truyền tải kiến thức lịch sử?",
//     category: "Thảo luận",
//     likes: 42,
//     dislikes: 3,
//     comments: [],
//     timestamp: "1 ngày trước",
//     tags: ["Giáo dục", "Lịch sử", "Gen Z"],
//     images: [], // Thêm field images
//   },
// ];

const mockUsersData = [
  {
    user_id: 1,
    name: "Nguyễn Văn An",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    joinedDate: "2024-01-15",
    bio: "Yêu thích công nghệ và chia sẻ kiến thức với cộng đồng",
    achievements: ["Thành viên tích cực", "Top 10 người đóng góp"],
    postsCount: 45,
  },
  {
    user_id: 2,
    name: "Trần Thị Bình",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    joinedDate: "2024-02-20",
    bio: "Đam mê du lịch và khám phá văn hóa",
    achievements: ["Chuyên gia du lịch", "Người truyền cảm hứng"],
    postsCount: 32,
  },
  {
    user_id: 3,
    name: "Lê Minh Châu",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    joinedDate: "2024-03-10",
    bio: "Giáo viên THPT, quan tâm đến giáo dục hiện đại",
    achievements: ["Chuyên gia giáo dục"],
    postsCount: 28,
  },
  {
    user_id: 4,
    name: "Phạm Hoàng Dũng",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    joinedDate: "2023-12-05",
    bio: "Nghiên cứu về di sản văn hóa Việt Nam",
    achievements: ["Chuyên gia di sản", "Người bảo tồn văn hóa"],
    postsCount: 52,
  },
];

const mockForumPostComments = [
  {
    post_comment_id: 1,
    post_id: 1,
    user_id: 2,
    content: "Bài viết rất hay! AI thực sự đang thay đổi thế giới.",
    created_date: "2026-01-23T10:30:00Z",
  },
  {
    post_comment_id: 2,
    post_id: 1,
    user_id: 3,
    content: "Cảm ơn bạn đã chia sẻ. Tôi rất quan tâm đến chủ đề này.",
    created_date: "2026-01-23T14:20:00Z",
  },
  {
    post_comment_id: 3,
    post_id: 2,
    user_id: 1,
    content: "Đà Lạt đẹp quá! Mình cũng muốn đi thử.",
    created_date: "2026-01-23T16:45:00Z",
  },
  {
    post_comment_id: 4,
    post_id: 3,
    user_id: 4,
    content: "Bài viết rất bổ ích, cảm ơn thầy!",
    created_date: "2026-01-24T09:15:00Z",
  },
  {
    post_comment_id: 5,
    post_id: 3,
    user_id: 2,
    content: "Tôi sẽ áp dụng những phương pháp này.",
    created_date: "2026-01-24T10:30:00Z",
  },
  {
    post_comment_id: 6,
    post_id: 5,
    user_id: 3,
    content: "Tôi nghĩ làm việc hybrid là tốt nhất.",
    created_date: "2026-01-24T11:00:00Z",
  },
  {
    post_comment_id: 7,
    post_id: 5,
    user_id: 2,
    content: "Làm việc từ xa giúp tôi tiết kiệm thời gian đi lại.",
    created_date: "2026-01-24T12:30:00Z",
  },
  {
    post_comment_id: 8,
    post_id: 5,
    user_id: 4,
    content: "Nhưng đôi khi thiếu sự giao tiếp trực tiếp.",
    created_date: "2026-01-24T13:15:00Z",
  },
  {
    post_comment_id: 9,
    post_id: 6,
    user_id: 1,
    content: "Danh sách rất đầy đủ và hữu ích!",
    created_date: "2026-01-24T14:20:00Z",
  },
];

const mockForumPostStages = [
  {
    post_stage_id: 1,
    post_id: 1,
    stage_name: "draft",
    created_date: "2026-01-22T07:00:00Z",
  },
  {
    post_stage_id: 2,
    post_id: 1,
    stage_name: "published",
    created_date: "2026-01-22T08:00:00Z",
  },
  {
    post_stage_id: 3,
    post_id: 2,
    stage_name: "published",
    created_date: "2026-01-21T14:30:00Z",
  },
  {
    post_stage_id: 4,
    post_id: 3,
    stage_name: "published",
    created_date: "2026-01-20T09:00:00Z",
  },
  {
    post_stage_id: 5,
    post_id: 4,
    stage_name: "published",
    created_date: "2026-01-19T11:20:00Z",
  },
  {
    post_stage_id: 6,
    post_id: 5,
    stage_name: "published",
    created_date: "2026-01-18T15:45:00Z",
  },
  {
    post_stage_id: 7,
    post_id: 6,
    stage_name: "published",
    created_date: "2026-01-17T10:00:00Z",
  },
];

// const mockForumPostVotes = [
//   // Post 1 - 45 likes, 32 hearts, 12 shares
//   ...Array.from({ length: 45 }, (_, i) => ({
//     post_vote_id: 1000 + i,
//     post_id: 1,
//     user_id: (i % 4) + 1,
//     vote_type: "like",
//     created_date: `2026-01-22T${String(9 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 32 }, (_, i) => ({
//     post_vote_id: 2000 + i,
//     post_id: 1,
//     user_id: (i % 4) + 1,
//     vote_type: "dislike",
//     created_date: `2026-01-22T${String(10 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 12 }, (_, i) => ({
//     post_vote_id: 3000 + i,
//     post_id: 1,
//     user_id: (i % 4) + 1,
//     vote_type: "share",
//     created_date: `2026-01-22T${String(11 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 19) % 60).padStart(2, "0")}:00Z`,
//   })),

//   // Post 2 - 78 likes, 56 hearts, 23 shares
//   ...Array.from({ length: 78 }, (_, i) => ({
//     post_vote_id: 4000 + i,
//     post_id: 2,
//     user_id: (i % 4) + 1,
//     vote_type: "like",
//     created_date: `2026-01-21T${String(15 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 56 }, (_, i) => ({
//     post_vote_id: 5000 + i,
//     post_id: 2,
//     user_id: (i % 4) + 1,
//     vote_type: "dislike",
//     created_date: `2026-01-21T${String(16 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 23 }, (_, i) => ({
//     post_vote_id: 6000 + i,
//     post_id: 2,
//     user_id: (i % 4) + 1,
//     vote_type: "share",
//     created_date: `2026-01-21T${String(17 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 15) % 60).padStart(2, "0")}:00Z`,
//   })),

//   // Post 3 - 34 likes, 28 hearts, 15 shares
//   ...Array.from({ length: 34 }, (_, i) => ({
//     post_vote_id: 7000 + i,
//     post_id: 3,
//     user_id: (i % 4) + 1,
//     vote_type: "like",
//     created_date: `2026-01-20T${String(10 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 12) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 28 }, (_, i) => ({
//     post_vote_id: 8000 + i,
//     post_id: 3,
//     user_id: (i % 4) + 1,
//     vote_type: "dislike",
//     created_date: `2026-01-20T${String(11 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 14) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 15 }, (_, i) => ({
//     post_vote_id: 9000 + i,
//     post_id: 3,
//     user_id: (i % 4) + 1,
//     vote_type: "share",
//     created_date: `2026-01-20T${String(12 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 16) % 60).padStart(2, "0")}:00Z`,
//   })),

//   // Post 4 - 56 likes, 45 hearts, 18 shares
//   ...Array.from({ length: 56 }, (_, i) => ({
//     post_vote_id: 10000 + i,
//     post_id: 4,
//     user_id: (i % 4) + 1,
//     vote_type: "like",
//     created_date: `2026-01-19T${String(12 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 45 }, (_, i) => ({
//     post_vote_id: 11000 + i,
//     post_id: 4,
//     user_id: (i % 4) + 1,
//     vote_type: "dislike",
//     created_date: `2026-01-19T${String(13 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 18 }, (_, i) => ({
//     post_vote_id: 12000 + i,
//     post_id: 4,
//     user_id: (i % 4) + 1,
//     vote_type: "share",
//     created_date: `2026-01-19T${String(14 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 15) % 60).padStart(2, "0")}:00Z`,
//   })),

//   // Post 5 - 42 likes, 31 hearts, 9 shares
//   ...Array.from({ length: 42 }, (_, i) => ({
//     post_vote_id: 13000 + i,
//     post_id: 5,
//     user_id: (i % 4) + 1,
//     vote_type: "like",
//     created_date: `2026-01-18T${String(16 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 12) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 31 }, (_, i) => ({
//     post_vote_id: 14000 + i,
//     post_id: 5,
//     user_id: (i % 4) + 1,
//     vote_type: "dislike",
//     created_date: `2026-01-18T${String(17 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 14) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 9 }, (_, i) => ({
//     post_vote_id: 15000 + i,
//     post_id: 5,
//     user_id: (i % 4) + 1,
//     vote_type: "share",
//     created_date: `2026-01-18T${String(18 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 16) % 60).padStart(2, "0")}:00Z`,
//   })),

//   // Post 6 - 92 likes, 71 hearts, 34 shares
//   ...Array.from({ length: 92 }, (_, i) => ({
//     post_vote_id: 16000 + i,
//     post_id: 6,
//     user_id: (i % 4) + 1,
//     vote_type: "like",
//     created_date: `2026-01-17T${String(11 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 71 }, (_, i) => ({
//     post_vote_id: 17000 + i,
//     post_id: 6,
//     user_id: (i % 4) + 1,
//     vote_type: "dislike",
//     created_date: `2026-01-17T${String(12 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}:00Z`,
//   })),
//   ...Array.from({ length: 34 }, (_, i) => ({
//     post_vote_id: 18000 + i,
//     post_id: 6,
//     user_id: (i % 4) + 1,
//     vote_type: "share",
//     created_date: `2026-01-17T${String(13 + Math.floor(i / 10)).padStart(2, "0")}:${String((i * 15) % 60).padStart(2, "0")}:00Z`,
//   })),
// ];

const mockForumPosts = [
  {
    post_id: 1,
    user_id: 1,
    content:
      "Trí tuệ nhân tạo đang phát triển với tốc độ chóng mặt. Trong năm 2026, chúng ta sẽ chứng kiến nhiều đột phá mới trong lĩnh vực này. AI không chỉ thay đổi cách chúng ta làm việc mà còn ảnh hưởng sâu rộng đến mọi khía cạnh của cuộc sống.",
    status: "published",
    tag: JSON.stringify(["AI", "công nghệ", "tương lai", "đổi mới"]),
    created_date: "2026-01-22T08:00:00Z",
    // Thông tin bổ sung không có trong ERD nhưng cần cho UI
    title: "Xu hướng AI trong năm 2026",
    category: "technology",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop",
    ]),
  },
  {
    post_id: 2,
    user_id: 2,
    content:
      "Đà Lạt mùa xuân là thời điểm tuyệt vời để du lịch. Hoa nở rộ khắp nơi, thời tiết mát mẻ dễ chịu. Hãy cùng tôi khám phá những địa điểm đẹp nhất của thành phố ngàn hoa.",
    status: "published",
    tag: JSON.stringify(["du lịch", "Đà Lạt", "mùa xuân", "hoa"]),
    created_date: "2026-01-21T14:30:00Z",
    title: "Khám phá vẻ đẹp Đà Lạt mùa xuân",
    category: "travel",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    ]),
  },
  {
    post_id: 3,
    user_id: 3,
    content:
      "Việc áp dụng phương pháp học tập đúng đắn sẽ giúp học sinh đạt kết quả tốt hơn. Trong bài viết này, tôi sẽ chia sẻ những kinh nghiệm từ thực tế giảng dạy của mình.",
    status: "published",
    tag: JSON.stringify(["giáo dục", "học tập", "phương pháp", "hiệu quả"]),
    created_date: "2026-01-20T09:00:00Z",
    title: "Phương pháp học tập hiệu quả cho học sinh",
    category: "education",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    ]),
  },
  {
    post_id: 4,
    user_id: 4,
    content:
      "Di sản văn hóa là tài sản quý giá của dân tộc. Trong bối cảnh hiện đại hóa, việc bảo tồn và phát huy giá trị di sản là trách nhiệm của mỗi người chúng ta.",
    status: "published",
    tag: JSON.stringify(["di sản", "văn hóa", "bảo tồn", "truyền thống"]),
    created_date: "2026-01-19T11:20:00Z",
    title: "Bảo tồn di sản văn hóa trong thời đại mới",
    category: "heritage",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop",
    ]),
  },
  {
    post_id: 5,
    user_id: 1,
    content:
      "Sau đại dịch, công việc từ xa đã trở thành xu hướng phổ biến. Liệu mô hình này có bền vững trong tương lai? Hãy cùng thảo luận về ưu và nhược điểm.",
    status: "published",
    tag: JSON.stringify([
      "thảo luận",
      "làm việc từ xa",
      "tương lai",
      "công việc",
    ]),
    created_date: "2026-01-18T15:45:00Z",
    title: "Thảo luận: Tương lai của công việc từ xa",
    category: "discussion",
    images: JSON.stringify([]),
  },
  {
    post_id: 6,
    user_id: 2,
    content:
      "Việt Nam có rất nhiều điểm đến tuyệt vời. Từ biển đảo đến núi rừng, từ phố cổ đến thành phố hiện đại. Cùng khám phá top 10 địa điểm không thể bỏ qua.",
    status: "published",
    tag: JSON.stringify(["du lịch", "Việt Nam", "top 10", "khám phá"]),
    created_date: "2026-01-17T10:00:00Z",
    title: "Top 10 địa điểm du lịch Việt Nam 2026",
    category: "travel",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop",
    ]),
  },
];

// const calculateTop8Tags = (postsData) => {
//   const allTags = postsData.flatMap((post) => post.tags || []);
//   const tagCounts = allTags.reduce((acc, tag) => {
//     const tagName = typeof tag === "string" ? tag : tag.name;
//     if (tagName) {
//       acc[tagName] = (acc[tagName] || 0) + 1;
//     }
//     return acc;
//   }, {});

//   return Object.entries(tagCounts)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 8)
//     .map(([tag, count]) => ({ tag, count }));
// };

export default function Forum() {
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [posts, setPosts] = useState(initialPosts);
  // const [editingPost, setEditingPost] = useState(null);
  // const [viewingProfile, setViewingProfile] = useState(null);
  // const [viewingDetail, setViewingDetail] = useState(null);
  // const [filterCategory, setFilterCategory] = useState("Tất cả");
  // const [sortBy, setSortBy] = useState("newest");
  const [users, setUsers] = useState(mockUsersData);
  const [comments, setComments] = useState(mockForumPostComments);
  // const [votes, setVotes] = useState(mockForumPostVotes);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stages, setStages] = useState(mockForumPostStages);
  // const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialCategory = searchParams.get("category") || "all";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [commentToDelete, setCommentToDelete] = useState(null); // Lưu { id, postId }
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [allFeaturedTags, setAllFeaturedTags] = useState([]);
  const [hasFetchedTotalTags, setHasFetchedTotalTags] = useState(false);
  const [allPostsForTags, setAllPostsForTags] = useState([]);
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const { user: currentUser } = useUser();
  const postsListRef = useRef(null);
  const prevPageRef = useRef(currentPage);

  // const categories = [
  //   "Tất cả",
  //   "Công nghệ",
  //   "Du lịch",
  //   "Thảo luận",
  //   "Giáo dục",
  //   "Di sản",
  // ];

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      if (categories.length === 0) setIsFiltersLoading(true);

      // Xác định có đang lọc hay không
      const isPopular = sortBy === "popular";
      const isMine = sortBy === "myself";

      const [postRes, catRes] = await Promise.all([
        forumService.getAllPosts({
          page: currentPage,
          limit: 10,
          category: selectedCategory,
          sortBy: sortBy,
          tag: selectedTag,
          popular: isPopular,
          myself: isMine,
        }),
        forumService.getCategories(),
      ]);

      if (postRes.success) {
        // Cập nhật state pagination từ API
        setPagination(postRes.pagination);

        const formattedPosts = postRes.data.map((post) => ({
          ...post,

          likes: post.likes || 0,
          dislikes: post.dislikes || 0,
          commentsCount: post.comment_count || 0,
          views: post.views || 0,
          liked: post.like || false,
          disliked: post.dislike || false,

          tags: post.tags
            ? post.tags.map((t) => (typeof t === "string" ? t : t.name))
            : [],
          displayImages: (post.images || []).map((img) => img.image_url),
          displayVideos: (post.videos || []).map((vid) => vid.video_url),
        }));

        setPosts(formattedPosts);
      }
      // So sánh nếu currentPage hiện tại khác với currentPage ở lần render trước

      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setIsLoading(false);
      setIsFiltersLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [currentPage, selectedCategory, sortBy, selectedTag]);

  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      if (postsListRef.current) {
        const yOffset = -100;
        const element = postsListRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }

    prevPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (sortBy !== "newest") params.sort = sortBy;
    if (selectedTag) params.tag = selectedTag;

    setSearchParams(params, { replace: true });
  }, [currentPage, selectedCategory, sortBy, selectedTag]);

  useEffect(() => {
    const getGlobalTopTags = async () => {
      if (hasFetchedTotalTags) return;
      try {
        const res = await forumService.getTags();
        if (Array.isArray(res)) {
          const formattedTags = res.map((item) => ({
            tag: item.tag?.name || "N/A",
            count: parseInt(item.usage_count) || 0,
          }));
          setAllFeaturedTags(formattedTags);
        } else if (res && res.success && Array.isArray(res.data)) {
          const formattedTags = res.data.map((item) => ({
            tag: item.tag?.name || "N/A",
            count: parseInt(item.usage_count) || 0,
          }));
          setAllFeaturedTags(formattedTags);
        }
      } catch (err) {
        console.error("Lỗi thống kê tag tổng thể:", err);
      } finally {
        setHasFetchedTotalTags(true);
      }
    };
    getGlobalTopTags();
  }, [hasFetchedTotalTags]);

  // 3. Reset về trang 1 khi người dùng thay đổi bộ lọc
  // Chỉ reset về trang 1 nếu người dùng chủ động thay đổi Category/Tag trên giao diện
  // useEffect(() => {
  //   // Lấy giá trị hiện tại trên URL để đối chiếu
  //   const urlCategory = searchParams.get("category") || "all";
  //   const urlTag = searchParams.get("tag") || null;

  //   // Nếu Category thay đổi HOẶC Tag thay đổi so với URL -> Reset về trang 1
  //   if (selectedCategory !== urlCategory || selectedTag !== urlTag) {
  //     setCurrentPage(1);
  //   }
  // }, [selectedCategory, selectedTag, searchParams]);

  // const getPostWithStats = (post) => {
  //   const comments = mockForumPostComments.filter(
  //     (c) => c.post_id === post.post_id,
  //   );
  //   const votes = mockForumPostVotes.filter((v) => v.post_id === post.post_id);

  //   // Views được tính dựa trên post_id để giữ consistency
  //   const viewsMapping = {
  //     1: 234,
  //     2: 456,
  //     3: 189,
  //     4: 312,
  //     5: 267,
  //     6: 589,
  //   };

  //   return {
  //     ...post,
  //     tags: JSON.parse(post.tag),
  //     images: JSON.parse(post.images),
  //     commentsCount: comments.length,
  //     likes: votes.filter((v) => v.vote_type === "like").length,
  //     dislikes: votes.filter((v) => v.vote_type === "dislike").length,
  //     shares: votes.filter((v) => v.vote_type === "share").length,
  //     views: viewsMapping[post.post_id] || 0,
  //   };
  // };

  // const [posts, setPosts] = useState(mockForumPosts.map(getPostWithStats));

  // Create new post
  const handleCreatePost = async (fullData) => {
    try {
      const response = await forumService.createPost(fullData);

      if (response.success) {
        const newPostFromApi = response.data;

        // Chuẩn hóa dữ liệu bài viết mới đồng bộ với cấu trúc list hiện tại
        const formattedNewPost = {
          ...newPostFromApi,

          post_id: newPostFromApi.id || newPostFromApi.post_id,

          tags: newPostFromApi.tags
            ? newPostFromApi.tags.map((t) =>
                typeof t === "string" ? t : t.name,
              )
            : [],

          likes: newPostFromApi.likes || 0,
          commentsCount: 0,
          views: 0,

          // Chuẩn hóa media URL
          displayImages: (newPostFromApi.images || []).map(
            (img) => img.image_url || img,
          ),
          displayVideos: (newPostFromApi.videos || []).map(
            (vid) => vid.video_url || vid,
          ),

          // Thông tin author và category
          author: newPostFromApi.author,
          post_category: newPostFromApi.post_category,
          category: newPostFromApi.post_category?.name,
        };

        // ✅ Cập nhật state thêm bài mới vào đầu mảng posts
        setPosts((prevPosts) => [formattedNewPost, ...prevPosts]);
        // setAllPostsForTags((prevAll) => {
        //   const updatedAll = [formattedNewPost, ...prevAll];
        //   setAllFeaturedTags(calculateTop8Tags(updatedAll));
        //   return updatedAll;
        // });
        setPagination((prev) => ({
          ...prev,
          total: (prev.total || 0) + 1,
        }));
        setHasFetchedTotalTags(false);
        toast.success("Đăng bài viết mới thành công! 🎉");
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      toast.error(
        "Lỗi: " + (error.response?.data?.message || "Không thể đăng bài"),
      );
    }
  };

  const handleEditPost = async (updatedPost) => {
    const currentScrollY = window.scrollY;
    try {
      setEditingPost(null);

      setHasFetchedTotalTags(false);

      await loadInitialData();

      window.scrollTo({
        top: currentScrollY,
        behavior: "auto",
      });

      const newStage = {
        post_stage_id: Date.now(),
        post_id: updatedPost.post_id || updatedPost.id,
        stage_name: "edited",
        created_date: new Date().toISOString(),
      };
      setStages((prevStages) => [...prevStages, newStage]);
    } catch (error) {
      console.error("Lỗi sau khi chỉnh sửa bài viết:", error);
      window.scrollTo(0, currentScrollY);
      toast.error(
        "Bài viết đã lưu nhưng không thể làm mới danh sách. Vui lòng tải lại trang.",
      );
    }
  };

  const getPostComments = (postId) => {
    return mockForumPostComments.filter((c) => c.post_id === postId);
  };

  // const getUserVoteForPost = (postId, userId) => {
  //   return mockForumPostVotes.filter(
  //     (v) => v.post_id === postId && v.user_id === userId,
  //   );
  // };

  const filteredAndSortedPosts = posts
    .filter((post) => {
      if (selectedCategory !== "all" && post.category_id !== selectedCategory)
        return false;

      if (selectedTag) {
        const hasTag = post.tags?.some((t) =>
          typeof t === "string" ? t === selectedTag : t.name === selectedTag,
        );
        if (!hasTag) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_date).getTime() -
          new Date(a.created_date).getTime()
        );
      } else {
        return b.likes - a.likes;
      }
    });

  const allTags = posts.flatMap((post) => post.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    const tagName = typeof tag === "string" ? tag : tag.name;
    if (tagName) {
      acc[tagName] = (acc[tagName] || 0) + 1;
    }
    return acc;
  }, {});

  const featuredTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  const handleReaction = async (postId, type) => {
    const oldPosts = [...posts];
    const oldSelectedPost = selectedPost ? { ...selectedPost } : null;

    const currentPost = posts.find(
      (p) =>
        String(p.id) === String(postId) || String(p.post_id) === String(postId),
    );

    if (!currentPost) {
      console.error("Không tìm thấy bài viết với ID:", postId);
      return;
    }
    console.log("Trạng thái hiện tại bài viết:", currentPost.liked);

    const updateUI = (newLiked, newDisliked, likesDelta, dislikesDelta) => {
      const updater = (p) => {
        const isTarget =
          String(p.id) === String(postId) ||
          String(p.post_id) === String(postId);
        if (isTarget) {
          return {
            ...p,
            liked: newLiked,
            disliked: newDisliked,
            likes: Math.max(0, (p.likes || 0) + likesDelta),
            dislikes: Math.max(0, (p.dislikes || 0) + dislikesDelta),
          };
        }
        return p;
      };

      setPosts((prev) => prev.map(updater));
      if (selectedPost) {
        setSelectedPost((prev) => (prev ? updater(prev) : null));
      }
    };

    if (type === "LIKE") {
      if (currentPost.liked === true) {
        updateUI(false, false, -1, 0);
      } else {
        const dislikeOffset = currentPost.disliked ? -1 : 0;
        updateUI(true, false, 1, dislikeOffset);
      }
    } else {
      if (currentPost.disliked === true) {
        updateUI(false, false, 0, -1);
      } else {
        const likeOffset = currentPost.liked ? -1 : 0;
        updateUI(false, true, likeOffset, 1);
      }
    }

    try {
      const res = await forumService.reactPost(postId, type);

      if (res.success) {
        // Cập nhật lại số liệu chuẩn xác từ Server trả về
        const syncWithServer = (p) => ({
          ...p,
          likes: res.likes,
          dislikes: res.dislikes,
          liked: res.liked,
          disliked: res.disliked,
        });

        setPosts((prev) =>
          prev.map((p) =>
            String(p.id) === String(postId) ||
            String(p.post_id) === String(postId)
              ? syncWithServer(p)
              : p,
          ),
        );

        if (selectedPost) {
          setSelectedPost((prev) => (prev ? syncWithServer(prev) : null));
        }
      } else {
        throw new Error("API trả về thất bại");
      }
    } catch (error) {
      setPosts(oldPosts);
      setSelectedPost(oldSelectedPost);
      console.error("Lỗi tương tác:", error);
      toast.error("Không thể thực hiện thao tác này", { id: "react-error" });
    }
  };

  // Gọi hàm chung cho cả 2 hành động
  // const handleLikePost = (postId) => handleReaction(postId, "LIKE");
  // const handleDislikePost = (postId) => handleReaction(postId, "DISLIKE");

  const handleSharePost = (postId) => {
    const newVote = {
      post_vote_id: Date.now(),
      post_id: postId,
      user_id: 1,
      vote_type: "share",
      created_date: new Date().toISOString(),
    };
    setVotes([...votes, newVote]);

    // Cập nhật post với stats mới
    setPosts(
      posts.map((post) =>
        post.post_id === postId ? { ...post, shares: post.shares + 1 } : post,
      ),
    );
    alert("Đã sao chép liên kết bài viết!");
  };

  const handleViewPost = async (post) => {
    setSelectedPost({
      ...post,
      isLoadingDetail: true,
    });
    try {
      // Gọi API lấy chi tiết
      const response = await forumService.getPostById(post.id);

      if (response.success) {
        const apiData = response.data;
        console.log("API detail:", apiData);
        // Sắp xếp bình luận từ mới nhất đến cũ nhất
        const sortedComments = (apiData.comments || []).sort((a, b) => {
          return (
            new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime()
          );
        });

        // Chuẩn hóa dữ liệu từ API
        const formattedPost = {
          ...apiData,
          user_id: apiData.user_id || apiData.author?.id,
          post_id: apiData.id || apiData.post_id,

          categoryName: apiData.post_category?.name,

          displayTags: apiData.tags?.map((t) => t.name) || [],

          displayImages: apiData.images?.map((img) => img.image_url) || [],
          displayVideos: apiData.videos?.map((vid) => vid.video_url) || [],
          liked: apiData.like,
          disliked: apiData.dislike,

          comments: sortedComments,
          likes: apiData.likes || 0,
          dislikes: apiData.dislikes || 0,
          views: apiData.views || 0,
          shares: apiData.shares || 0,
          isLoadingDetail: false,
        };

        setSelectedPost(formattedPost);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết bài viết:", error);
      toast.error("Không thể tải nội dung bài viết chi tiết.");
      setSelectedPost(null);
    }
  };

  const handleAddComment = async (postId, commentContent) => {
    try {
      const response = await forumService.postComment(postId, commentContent);

      if (response.success) {
        const newCommentApi = response.data;

        // Cập nhật số lượng bình luận
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            const isTargetPost =
              String(post.post_id) === String(postId) ||
              String(post.id) === String(postId);
            return isTargetPost
              ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
              : post;
          }),
        );

        // Cập nhật nội dung Modal nếu đang mở bài viết
        if (selectedPost) {
          const isCurrentModal =
            String(selectedPost.post_id) === String(postId) ||
            String(selectedPost.id) === String(postId);

          if (isCurrentModal) {
            setSelectedPost((prev) => ({
              ...prev,
              // Thêm comment mới vào mảng
              comments: [newCommentApi, ...(prev.comments || [])],
              commentsCount: (prev.commentsCount || 0) + 1,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      alert("Không thể gửi bình luận. Vui lòng thử lại sau!");
    }
  };

  const triggerDeleteComment = (commentId, postId) => {
    setCommentToDelete({ id: commentId, postId: postId });
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    setIsDeletingComment(true);

    try {
      const { id, postId } = commentToDelete;
      const response = await forumService.deleteComment(id);

      if (response.success) {
        if (selectedPost) {
          setSelectedPost((prev) => ({
            ...prev,
            comments: prev.comments.filter(
              (c) => c.id !== id && c.post_comment_id !== id,
            ),
            commentsCount: Math.max(0, (prev.commentsCount || 1) - 1),
          }));
        }
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId || post.id === postId
              ? {
                  ...post,
                  commentsCount: Math.max(0, (post.commentsCount || 1) - 1),
                }
              : post,
          ),
        );
        toast.success("Đã xóa bình luận!");
        setCommentToDelete(null);
      }
    } catch (error) {
      toast.error("Lỗi: " + (error.message || "Không thể xóa"));
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleSendMessage = (userId, message) => {
    alert(
      `Tin nhắn đã được gửi đến ${users.find((u) => u.user_id === userId)?.name}: ${message}`,
    );
    setMessageRecipient(null);
  };

  const handleDeletePost = async (postId) => {
    const toastId = toast.loading("Đang xóa bài viết...");
    try {
      const response = await forumService.deletePost(postId);

      if (response.success) {
        // Xóa bài viết khỏi mảng posts hiện tại
        setPosts((prevPosts) =>
          prevPosts.filter(
            (p) =>
              String(p.id) !== String(postId) &&
              String(p.post_id) !== String(postId),
          ),
        );

        // Cập nhật kho tổng và tính lại tag
        // setAllPostsForTags((prevAll) => {
        //   const updatedAll = prevAll.filter(
        //     (p) => String(p.id || p.post_id) !== String(postId),
        //   );
        //   setAllFeaturedTags(calculateTop8Tags(updatedAll));
        //   return updatedAll;
        // });

        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));

        setSelectedPost(null);
        setHasFetchedTotalTags(false);
        toast.success("Xóa bài viết thành công!", { id: toastId });
      } else {
        toast.error("Lỗi: " + response.message, { id: toastId });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ", { id: toastId });
    }
  };

  const handleEditPostClick = () => {
    setEditingPost(selectedPost);
    setSelectedPost(null);
  };

  const handleShowProfile = async (userId) => {
    try {
      setSelectedUser({ isLoading: true });

      const [userRes, postsRes] = await Promise.all([
        forumService.getUserById(userId),
        forumService.getMyPosts(),
      ]);

      if (userRes.success) {
        const apiUser = userRes.data.user;
        const totalPostsFromApi = postsRes?.pagination?.total || 0;
        const allUserPosts = postsRes?.success ? postsRes.data : [];
        const top2Posts = allUserPosts.slice(0, 2);

        // Chuẩn hóa dữ liệu để khớp với UserProfileModal
        const formattedUser = {
          user_id: apiUser.id,
          name: apiUser.name,
          avatar: apiUser.avatar,
          bio: apiUser.intro || "Chưa có giới thiệu",
          joinedDate: apiUser.create_at,
          email: apiUser.email,
          totalPosts: totalPostsFromApi,
          userOwnPosts: top2Posts,
        };

        setSelectedUser(formattedUser);
      } else {
        toast.error("Không thể tải thông tin người dùng");
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi tải profile:", error);
      toast.error("Đã xảy ra lỗi khi tải hồ sơ");
      setSelectedUser(null);
    }
  };

  //
  // const handleCreatePost = (newPost) => {
  //   const post = {
  //     id: Date.now(),
  //     ...newPost,
  //     author: {
  //       name: "Người dùng hiện tại",
  //       role: "Thành viên",
  //       avatar: "ND",
  //       bio: "Thành viên mới của cộng đồng",
  //       posts: 1,
  //       joined: "Tháng 10, 2025",
  //     },
  //     likes: 0,
  //     dislikes: 0,
  //     comments: [],
  //     timestamp: "Vừa xong",
  //     images: newPost.images || [], // Đảm bảo có field images
  //   };
  //   setPosts([post, ...posts]);
  //   setShowCreateModal(false);
  // };

  // // Edit post
  // const handleEditPost = (updatedPost) => {
  //   setPosts(
  //     posts.map((p) =>
  //       p.id === updatedPost.id ? { ...p, ...updatedPost } : p,
  //     ),
  //   );
  //   setEditingPost(null);
  // };

  // // Delete post
  // const handleDeletePost = (postId) => {
  //   if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
  //     setPosts(posts.filter((p) => p.id !== postId));
  //   }
  // };

  // // Like/Dislike
  // const handleLike = (postId) => {
  //   setPosts(
  //     posts.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
  //   );
  // };

  // const handleDislike = (postId) => {
  //   setPosts(
  //     posts.map((p) =>
  //       p.id === postId ? { ...p, dislikes: p.dislikes + 1 } : p,
  //     ),
  //   );
  // };

  // // Add comment
  // const handleAddComment = (postId, comment) => {
  //   setPosts(
  //     posts.map((p) =>
  //       p.id === postId
  //         ? {
  //             ...p,
  //             comments: [
  //               ...p.comments,
  //               {
  //                 id: Date.now(),
  //                 author: "Người dùng hiện tại",
  //                 content: comment,
  //                 timestamp: "Vừa xong",
  //               },
  //             ],
  //           }
  //         : p,
  //     ),
  //   );
  // };

  // // Filter and sort
  // const filteredPosts = posts
  //   .filter((p) => filterCategory === "Tất cả" || p.category === filterCategory)
  //   .sort((a, b) => {
  //     if (sortBy === "popular") return b.likes - a.likes;
  //     return 0; // newest is default order
  //   });

  return (
    <div className="min-h-screen bg-[#f6eadf] text-gray-800 relative">
      {/* Header */}
      <header className="relative overflow-hidden py-12 sm:py-14 lg:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-4 border border-orange-200 hover:bg-white/90 hover:scale-105 transition-all cursor-default"
            >
              <Sparkles className="w-6 h-6 text-orange-500" />
              <span className="text-base text-orange-700">
                Cộng đồng năng động
              </span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-amber-900 leading-tight">
              Chào mừng đến với <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                Diễn đàn cộng đồng
              </span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-amber-800 max-w-3xl mx-auto leading-relaxed">
              Nơi kết nối, chia sẻ kiến thức và trải nghiệm. Cùng nhau xây dựng
              một cộng đồng năng động và tích cực.
            </p>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {[
                {
                  Icon: MessageSquare,
                  title: "Chia sẻ",
                  desc: "Đăng bài và thảo luận về các chủ đề yêu thích",
                  color: "amber",
                },
                {
                  Icon: Users,
                  title: "Kết nối",
                  desc: "Gặp gỡ những người cùng sở thích",
                  color: "orange",
                },
                {
                  Icon: TrendingUp,
                  title: "Phát triển",
                  desc: "Học hỏi và trưởng thành cùng cộng đồng",
                  color: "amber",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    backgroundColor: "rgb(251, 235, 220)",
                  }}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-150 ease-out group cursor-pointer border border-transparent"
                >
                  <div
                    className={`bg-${item.color}-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:shadow-md transition-all duration-150`}
                  >
                    <item.Icon
                      className={`w-6 h-6 text-${item.color}-700 group-hover:scale-125 transition-transform duration-150`}
                    />
                  </div>
                  <h3 className="font-bold text-amber-900 mb-2 text-lg group-hover:text-amber-600 transition-colors duration-150">
                    {item.title}
                  </h3>
                  <p className="text-sm text-amber-700 group-hover:text-amber-900 transition-colors duration-150">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-0 w-64 h-64 bg-orange-300 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"
        />
      </header>
      {/* <header className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-20 px-5 border-b-4 border-amber-500">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 px-4 py-2 rounded-full mb-6">
              <i className="fa-solid fa-comments text-amber-400" />
              <span className="text-amber-300 text-sm font-semibold tracking-wide">
                COMMUNITY FORUM
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Diễn đàn Cộng đồng
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Nơi chia sẻ, thảo luận và kết nối về văn hóa, lịch sử và di sản
              Việt Nam
            </p>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.01 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center my-8"
        >
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-600 text-zinc-100 px-7 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 font-semibold text-lg group overflow-hidden"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <PenSquare className="w-6 h-6" />
            </motion.div>
            <span className="relative z-10">Tạo bài viết mới</span>

            {/* Animated background effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(251,146,60,0.5) 0%, rgba(245,158,11,0.5) 100%)",
                  "linear-gradient(180deg, rgba(251,146,60,0.5) 0%, rgba(245,158,11,0.5) 100%)",
                  "linear-gradient(270deg, rgba(251,146,60,0.5) 0%, rgba(245,158,11,0.5) 100%)",
                  "linear-gradient(360deg, rgba(251,146,60,0.5) 0%, rgba(245,158,11,0.5) 100%)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.button>
        </motion.div>
        <Filters
          isLoading={isFiltersLoading}
          selectedCategory={selectedCategory}
          onCategoryChange={(newCatId) => {
            setSelectedCategory(newCatId);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortChange={(newSort) => {
            setSortBy(newSort);
            setCurrentPage(1);
          }}
          categories={categories}
        />
        <div ref={postsListRef} />
        <FeaturedTopics
          isLoading={!hasFetchedTotalTags}
          tags={allFeaturedTags}
          selectedTag={selectedTag}
          onTagClick={(tagName) => {
            const newTag = selectedTag === tagName ? null : tagName;
            setSelectedTag(newTag);
            setCurrentPage(1);
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4 min-h-[100vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-amber-900 text-2xl">
              Bài viết{" "}
              <span className="text-orange-600">({pagination.total})</span>
            </h3>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-amber-100 rounded" />
                      <div className="h-3 w-24 bg-amber-50 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-3/4 bg-amber-100 rounded mb-3" />
                  <div className="h-20 w-full bg-amber-50 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* TRẠNG THÁI TRỐNG */}
              {posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-md p-12 text-center"
                >
                  <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileX className="w-10 h-10 text-amber-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-amber-900 mb-2">
                    Không tìm thấy bài viết nào
                  </h4>
                  <p className="text-amber-600">Hãy thử thay đổi bộ lọc</p>
                </motion.div>
              ) : (
                /* DANH SÁCH BÀI VIẾT */
                <div className="space-y-4 mb-6">
                  {filteredAndSortedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PostCard
                        post={post}
                        author={post.author}
                        onPostClick={() => handleViewPost(post)}
                        onAvatarClick={() => handleShowProfile(post.author.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
          {/* Pagination Section */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 py-12 border-t border-amber-100 mt-5">
              <div className="flex items-center gap-2">
                {/* Nút Previous */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-50 hover:border-orange-300 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Danh sách các số trang */}
                <div className="flex items-center gap-1.5">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = currentPage === pageNum;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-11 h-11 rounded-xl font-bold transition-all duration-300 transform ${
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md scale-110 z-10"
                            : "bg-white text-amber-900 border border-amber-100 hover:border-orange-200 hover:bg-orange-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Nút Next */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages),
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-50 hover:border-orange-300 transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thông tin thống kê */}
              {/* <p className="text-sm text-amber-800/70 font-medium italic">
                Đang hiển thị{" "}
                <span className="text-orange-600 font-bold">
                  {posts.length}
                </span>{" "}
                trên tổng số{" "}
                <span className="text-orange-600 font-bold">
                  {pagination.total}
                </span>{" "}
                bài viết
              </p> */}
            </div>
          )}
        </motion.div>
      </motion.main>

      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={handleEditPost}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() =>
            handleReaction(selectedPost.id || selectedPost.post_id, "LIKE")
          }
          onDislike={() =>
            handleReaction(selectedPost.id || selectedPost.post_id, "DISLIKE")
          }
          onShare={() => handleSharePost(selectedPost.post_id)}
          onAddComment={(comment) =>
            handleAddComment(selectedPost.post_id, comment)
          }
          onDeleteComment={(commentId) =>
            triggerDeleteComment(commentId, selectedPost.id)
          }
          currentUser={currentUser}
          onAvatarClick={(userId) => handleShowProfile(userId)}
          onDelete={() => handleDeletePost(selectedPost.post_id)}
          onEdit={() => handleEditPostClick()}
        />
      )}

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          posts={selectedUser.userOwnPosts || []}
          totalPosts={selectedUser.totalPosts || 0}
          onClose={() => setSelectedUser(null)}
          onSendMessage={() => setMessageRecipient(selectedUser)}
          onPostClick={(postId) => {
            const post = (selectedUser.userOwnPosts || []).find(
              (p) => (p.id || p.post_id) === postId,
            );
            if (post) handleViewPost(post);
          }}
        />
      )}

      {commentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-amber-100"
          >
            <h3 className="text-xl font-bold text-amber-900 mb-2 text-center">
              Xác nhận xóa?
            </h3>
            <p className="text-amber-700 text-center mb-6">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bình
              luận này không?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCommentToDelete(null)}
                disabled={isDeletingComment}
                className="flex-1 py-2.5 rounded-lg font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteComment}
                disabled={isDeletingComment}
                className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeletingComment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="leading-none">Đang xóa...</span>
                  </>
                ) : (
                  <span className="leading-none">Xóa ngay</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {messageRecipient && (
        <MessageModal
          recipient={messageRecipient}
          onClose={() => setMessageRecipient(null)}
          onSend={(message) =>
            handleSendMessage(messageRecipient.user_id, message)
          }
        />
      )}

      {/* <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16"> */}
      {/* Actions Bar */}
      {/* <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-amber-300/50 flex items-center justify-center gap-2 group"
          >
            <i className="fa-solid fa-plus group-hover:rotate-90 transition-transform duration-300" />
            Tạo bài viết mới
          </button> */}

      {/* Filters */}
      {/* <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center"> */}
      {/* Category Filter */}
      {/* <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select> */}

      {/* Sort */}
      {/* <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
            </select>
          </div>
        </div> */}

      {/* Trending Topics */}
      {/* <div className="mb-8 bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 shadow-lg border border-amber-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-fire text-amber-600" />
            Chủ đề nổi bật
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Công nghệ VR/AR",
              "Bảo tồn di sản",
              "Lịch sử Việt Nam",
              "Du lịch văn hóa",
              "Kiến trúc cổ",
            ].map((topic, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white hover:bg-amber-100 text-gray-700 hover:text-amber-700 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-amber-200 hover:border-amber-400"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div> */}

      {/* Posts List */}
      {/* <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-amber-200">
              <i className="fa-solid fa-inbox text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Chưa có bài viết nào</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDislike={handleDislike}
                onEdit={() => setEditingPost(post)}
                onDelete={handleDeletePost}
                onViewProfile={() => setViewingProfile(post.author)}
                onViewDetail={() => setViewingDetail(post)}
              />
            ))
          )}
        </div>
      </div> */}

      {/* Modals */}
      {/* {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePost}
        />
      )} */}

      {/* {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleEditPost}
        />
      )}

      {viewingProfile && (
        <UserProfileModal
          user={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}

      {viewingDetail && (
        <PostDetailModal
          post={viewingDetail}
          onClose={() => setViewingDetail(null)}
          onLike={handleLike}
          onDislike={handleDislike}
          onAddComment={handleAddComment}
          onViewProfile={() => setViewingProfile(viewingDetail.author)}
        />
      )} */}

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </div>
  );
}
