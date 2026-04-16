// import React, { useState } from 'react';
// import './community.css'
// import Footer from '../../components/Footer';
// interface Reply {
//   id: number;
//   author: string;
//   location: string;
//   timeAgo: string;
//   content: string;
//   likes: number;
// }

// interface Question {
//   id: number;
//   author: string;
//   location: string;
//   timeAgo: string;
//   title: string;
//   content: string;
//   likes: number;
//   replies: Reply[];
//   solved: boolean;
// }

// const CommunityExpertsScreen: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('forum');
//   const [showAskForm, setShowAskForm] = useState(false);
//   const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
//   const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
//   const [newReply, setNewReply] = useState('');

//   const [questions, setQuestions] = useState<Question[]>([
//     {
//       id: 1,
//       author: 'Ramesh Patil',
//       location: 'Maharashtra',
//       timeAgo: '2 hours ago',
//       title: 'Best organic fertilizer for wheat in clay soil?',
//       content: 'I have 3 acres of wheat in clay soil. Looking for organic fertilizer recommendations. Has anyone tried vermicompost?',
//       likes: 24,
//       solved: false,
//       replies: [
//         {
//           id: 101,
//           author: 'Dr. Amit Kumar',
//           location: 'Agricultural Expert',
//           timeAgo: '1 hour ago',
//           content: 'Vermicompost is excellent for clay soil. Use 2-3 tons per acre. Mix with neem cake for better results. Also maintain pH between 6.5-7.5.',
//           likes: 18
//         },
//         {
//           id: 102,
//           author: 'Vijay Singh',
//           location: 'Punjab',
//           timeAgo: '45 minutes ago',
//           content: 'I used vermicompost last season. Got 20% better yield! Make sure to apply it 2 weeks before sowing.',
//           likes: 12
//         }
//       ]
//     },
//     {
//       id: 2,
//       author: 'Suresh Kumar',
//       location: 'Punjab',
//       timeAgo: '5 hours ago',
//       title: 'Yellow leaves on paddy - what could be the issue?',
//       content: 'My paddy plants are showing yellow leaves in patches. Irrigation is regular. Could this be nitrogen deficiency?',
//       likes: 15,
//       solved: true,
//       replies: [
//         {
//           id: 201,
//           author: 'Dr. Priya Reddy',
//           location: 'Plant Pathologist',
//           timeAgo: '4 hours ago',
//           content: 'Yes, this is nitrogen deficiency. Apply urea @ 50 kg per acre. Also check for iron deficiency if yellowing continues.',
//           likes: 22
//         }
//       ]
//     },
//     {
//       id: 3,
//       author: 'Priya Sharma',
//       location: 'Gujarat',
//       timeAgo: '1 day ago',
//       title: 'Drip irrigation system - worth the investment?',
//       content: 'Thinking of installing drip irrigation for my cotton field. What are your experiences? How much water can we save?',
//       likes: 32,
//       solved: false,
//       replies: [
//         {
//           id: 301,
//           author: 'Rajesh Patel',
//           location: 'Gujarat',
//           timeAgo: '18 hours ago',
//           content: 'Absolutely worth it! Saved 40% water in my cotton farm. Initial cost is high but recovers in 2 years through water savings and better yield.',
//           likes: 28
//         },
//         {
//           id: 302,
//           author: 'Ankit Mehta',
//           location: 'Maharashtra',
//           timeAgo: '12 hours ago',
//           content: 'Check for government subsidies. I got 50% subsidy on drip system. Water saving is around 35-45%.',
//           likes: 15
//         }
//       ]
//     }
//   ]);

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   const getRandomColor = (index: number) => {
//     const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
//     return colors[index % colors.length];
//   };

//   const handleAskQuestion = () => {
//     setShowAskForm(true);
//     setSelectedQuestion(null);
//   };

//   const handleSubmitQuestion = () => {
//     if (newQuestion.title.trim() && newQuestion.content.trim()) {
//       const question: Question = {
//         id: Date.now(),
//         author: 'You',
//         location: 'Pune, Maharashtra',
//         timeAgo: 'Just now',
//         title: newQuestion.title,
//         content: newQuestion.content,
//         likes: 0,
//         solved: false,
//         replies: []
//       };
//       setQuestions([question, ...questions]);
//       setNewQuestion({ title: '', content: '' });
//       setShowAskForm(false);
//     }
//   };

//   const handleViewReplies = (question: Question) => {
//     setSelectedQuestion(question);
//     setShowAskForm(false);
//   };

//   const handleSubmitReply = () => {
//     if (newReply.trim() && selectedQuestion) {
//       const reply: Reply = {
//         id: Date.now(),
//         author: 'You',
//         location: 'Pune, Maharashtra',
//         timeAgo: 'Just now',
//         content: newReply,
//         likes: 0
//       };
      
//       const updatedQuestions = questions.map(q => 
//         q.id === selectedQuestion.id 
//           ? { ...q, replies: [...q.replies, reply] }
//           : q
//       );
      
//       setQuestions(updatedQuestions);
//       setSelectedQuestion({
//         ...selectedQuestion,
//         replies: [...selectedQuestion.replies, reply]
//       });
//       setNewReply('');
//     }
//   };

//   const handleBack = () => {
//     if (selectedQuestion) {
//       setSelectedQuestion(null);
//     } else if (showAskForm) {
//       setShowAskForm(false);
//     }
//   };

//   return (
//     <div className="container">
//       {/* Header */}
//       <header className="header">
//         <button className="backButton" onClick={handleBack}>←</button>
//         <h1 className="headerTitle">
//           {selectedQuestion ? 'Question Details' : showAskForm ? 'Ask a Question' : 'Community & Experts'}
//         </h1>
//       </header>

//       {/* Tabs - Only show when not in ask form or viewing replies */}
//       {!showAskForm && !selectedQuestion && (
//         <div className="tabContainer">
//           <button 
//             className={`tab ${activeTab === 'forum' ? 'tabActive' : ''}`}
//             onClick={() => setActiveTab('forum')}
//           >
//             Community Forum
//           </button>
//         </div>
//       )}

//       {/* Content */}
//       <main className="content">
//         {/* Ask Question Form */}
//         {showAskForm && (
//           <div className="askForm">
//             <div className="formGroup">
//               <label className="label">Question Title *</label>
//               <input
//                 type="text"
//                 className="input"
//                 placeholder="Enter your question title"
//                 value={newQuestion.title}
//                 onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
//               />
//             </div>

//             <div className="formGroup">
//               <label className="label">Description *</label>
//               <textarea
//                 className="textarea"
//                 placeholder="Provide detailed description of your question..."
//                 value={newQuestion.content}
//                 onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
//                 rows={6}
//               />
//             </div>

//             <button className="submitButton" onClick={handleSubmitQuestion}>
//               Post Question
//             </button>
//           </div>
//         )}

//         {/* Question Details with Replies */}
//         {selectedQuestion && (
//           <div className="detailsView">
//             {/* Original Question */}
//             <div className="questionDetailCard">
//               <div className="questionHeader">
//                 <div 
//                   className="avatar"
//                     style={{ background: getRandomColor(0) }}
//                 >
//                   {getInitials(selectedQuestion.author)}
//                 </div>
//                 <div className="authorInfo">
//                   <div className="authorName">{selectedQuestion.author}</div>
//                   <div className="authorMeta">
//                     {selectedQuestion.location} • {selectedQuestion.timeAgo}
//                   </div>
//                 </div>
//                 {selectedQuestion.solved && (
//                   <div className="solvedBadge">
//                     <span className="solvedIcon">✓</span> Solved
//                   </div>
//                 )}
//               </div>

//               <div className="questionContent">
//                 <h2 className="questionDetailTitle">{selectedQuestion.title}</h2>
//                 <p className="questionText">{selectedQuestion.content}</p>
//               </div>

//               <div className="questionFooter">
//                 <button className="actionButton">
//                   <span className="actionIcon">👍</span>
//                   <span className="actionText">{selectedQuestion.likes}</span>
//                 </button>
//               </div>
//             </div>

//             {/* Replies Section */}
//             <div className="repliesSection">
//               <h3 className="repliesTitle">
//                 Replies ({selectedQuestion.replies.length})
//               </h3>

//               {selectedQuestion.replies.map((reply, index) => (
//                 <div key={reply.id} className="replyCard">
//                   <div className="replyHeader">
//                     <div 
//                       className="avatarSmall"
//                       style={{
//                         background: getRandomColor(reply.id)
//                       }}
//                     >
//                       {getInitials(reply.author)}
//                     </div>
//                     <div className="authorInfo">
//                       <div className="replyAuthorName">{reply.author}</div>
//                       <div className="authorMeta">
//                         {reply.location} • {reply.timeAgo}
//                       </div>
//                     </div>
//                   </div>
//                   <p className="replyText">{reply.content}</p>
//                   <button className="actionButton">
//                     <span className="actionIcon">👍</span>
//                     <span className="actionText">{reply.likes}</span>
//                   </button>
//                 </div>
//               ))}
//             </div>

//             {/* Reply Input */}
//             <div className="replyInputSection">
//               <textarea
//                 className="replyInput"
//                 placeholder="Write your reply..."
//                 value={newReply}
//                 onChange={(e) => setNewReply(e.target.value)}
//                 rows={3}
//               />
//               <button className="replyButton" onClick={handleSubmitReply}>
//                 Post Reply
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Questions List */}
//         {!showAskForm && !selectedQuestion && (
//           <>
//             <button className="askButton" onClick={handleAskQuestion}>
//               <span className="askIcon">💬</span>
//               Ask a Question
//             </button>

//             <div className="questionsList">
//               {questions.map((question, index) => (
//                 <div 
//                   key={question.id} 
//                   className="questionCard"
//                   onClick={() => handleViewReplies(question)}
//                 >
//                   <div className="questionHeader">
//                     <div 
//                       className="avatar"
//                       style={{
//                         background: getRandomColor(index)
//                       }}
//                     >
//                       {getInitials(question.author)}
//                     </div>
//                     <div className="authorInfo">
//                       <div className="authorName">{question.author}</div>
//                       <div className="authorMeta">
//                         {question.location} • {question.timeAgo}
//                       </div>
//                     </div>
//                     {question.solved && (
//                       <div className="solvedBadge">
//                         <span className="solvedIcon">✓</span> Solved
//                       </div>
//                     )}
//                   </div>

//                   <div className="questionContent">
//                     <h3 className="questionTitle">{question.title}</h3>
//                     <p className="questionText">{question.content}</p>
//                   </div>

//                   <div className="questionFooter">
//                     <button className="actionButton" onClick={(e) => e.stopPropagation()}>
//                       <span className="actionIcon">👍</span>
//                       <span className="actionText">{question.likes}</span>
//                     </button>
//                     <button className="actionButton">
//                       <span className="actionIcon">💬</span>
//                       <span className="actionText">{question.replies.length} Replies</span>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </main>

//       {/* Bottom Navigation */}
//       <Footer />
//     </div>
//   );
// };



// export default CommunityExpertsScreen;

import React, { useState, useEffect } from 'react';
import './community.css'
import Footer from '../../components/Footer';

interface Reply {
  id: any;
  author: string;
  location: string;
  timeAgo: string;
  content: string;
  likes: number;
  userId?: string;
}

interface Question {
  id: any;
  author: string;
  location: string;
  timeAgo: string;
  title: string;
  content: string;
  likes: number;
  replies: Reply[];
  solved: boolean;
  userId?: string;
}

console.log("Community userId:", localStorage.getItem("userId"));

const CommunityExpertsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forum');
  const [showAskForm, setShowAskForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState('');

  // 🔐 Replace with actual logged-in user ID (from auth/session)
  const loggedInUserId = localStorage.getItem("userId") || "";

  const [questions, setQuestions] = useState<Question[]>([
    // 🔴 KEEPING YOUR HARDCODED DATA AS IT IS
    {
      id: 1,
      author: 'Ramesh Patil',
      location: 'Maharashtra',
      timeAgo: '2 hours ago',
      title: 'Best organic fertilizer for wheat in clay soil?',
      content: 'I have 3 acres of wheat in clay soil. Looking for organic fertilizer recommendations. Has anyone tried vermicompost?',
      likes: 24,
      solved: false,
      replies: [
        {
          id: 101,
          author: 'Dr. Amit Kumar',
          location: 'Agricultural Expert',
          timeAgo: '1 hour ago',
          content: 'Vermicompost is excellent for clay soil. Use 2-3 tons per acre. Mix with neem cake for better results. Also maintain pH between 6.5-7.5.',
          likes: 18
        },
        {
          id: 102,
          author: 'Vijay Singh',
          location: 'Punjab',
          timeAgo: '45 minutes ago',
          content: 'I used vermicompost last season. Got 20% better yield! Make sure to apply it 2 weeks before sowing.',
          likes: 12
        }
      ]
    },
    {
      id: 2,
      author: 'Suresh Kumar',
      location: 'Punjab',
      timeAgo: '5 hours ago',
      title: 'Yellow leaves on paddy - what could be the issue?',
      content: 'My paddy plants are showing yellow leaves in patches. Irrigation is regular. Could this be nitrogen deficiency?',
      likes: 15,
      solved: true,
      replies: [
        {
          id: 201,
          author: 'Dr. Priya Reddy',
          location: 'Plant Pathologist',
          timeAgo: '4 hours ago',
          content: 'Yes, this is nitrogen deficiency. Apply urea @ 50 kg per acre. Also check for iron deficiency if yellowing continues.',
          likes: 22
        }
      ]
    },
    {
      id: 3,
      author: 'Priya Sharma',
      location: 'Gujarat',
      timeAgo: '1 day ago',
      title: 'Drip irrigation system - worth the investment?',
      content: 'Thinking of installing drip irrigation for my cotton field. What are your experiences? How much water can we save?',
      likes: 32,
      solved: false,
      replies: [
        {
          id: 301,
          author: 'Rajesh Patel',
          location: 'Gujarat',
          timeAgo: '18 hours ago',
          content: 'Absolutely worth it! Saved 40% water in my cotton farm. Initial cost is high but recovers in 2 years through water savings and better yield.',
          likes: 28
        },
        {
          id: 302,
          author: 'Ankit Mehta',
          location: 'Maharashtra',
          timeAgo: '12 hours ago',
          content: 'Check for government subsidies. I got 50% subsidy on drip system. Water saving is around 35-45%.',
          likes: 15
        }
      ]
    }
  ]);

  // 🧠 "You" logic
  const getAuthorName = (userId: string | undefined, name: string) => {
    if (!userId) return name;
    return userId === loggedInUserId ? "You" : name;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now.getTime() - past.getTime()) / 60000);

    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  // 🔄 Convert backend data → UI format
  const formatQuestion = (q: any): Question => ({
    id: q._id,
    userId: q.user?._id || "",
    author: getAuthorName(q.user?._id, q.user?.name || "Unknown"),
    location: "India",
    timeAgo: getTimeAgo(q.createdAt),
    title: q.title,
    content: q.content,
    likes: q.likes || 0,
    solved: q.solved || false,
    replies: (q.replies || []).map((r: any) => ({
      id: r._id,
      userId: r.user?._id || "",
      author: getAuthorName(r.user?._id, r.user?.name || "Unknown"),
      location: "India",
      timeAgo: getTimeAgo(r.createdAt),
      content: r.content,
      likes: r.likes || 0
    }))
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/community/questions")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(formatQuestion);

        // ✅ Merge WITHOUT duplicates
        const uniqueQuestions = [
          ...formatted,
          ...questions.filter(q => typeof q.id === "number") // only hardcoded
        ];

        setQuestions(uniqueQuestions);
      })
      .catch(err => console.log(err));
  }, []);

  const getInitials = (name: string = "User") => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRandomColor = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  const handleAskQuestion = () => {
    setShowAskForm(true);
    setSelectedQuestion(null);
  };

  const handleSubmitQuestion = async () => {
    if (newQuestion.title.trim() && newQuestion.content.trim()) {

      const res = await fetch("http://localhost:5000/api/community/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userid": loggedInUserId
        },
        body: JSON.stringify(newQuestion)
      });

      const data = await res.json();

      const formatted = formatQuestion(data.question);

      setQuestions(prev => [formatted, ...prev]);

      setNewQuestion({ title: '', content: '' });
      setShowAskForm(false);
    }
  };

  const handleViewReplies = (question: Question) => {
    setSelectedQuestion(question);
    setShowAskForm(false);
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim() || !selectedQuestion) return;

    // ❌ If it's hardcoded question → DON'T CALL API
    if (typeof selectedQuestion.id === "number") {
      const reply: Reply = {
        id: Date.now(),
        author: "You",
        location: "India",
        timeAgo: "Just now",
        content: newReply,
        likes: 0
      };

      const updated = {
        ...selectedQuestion,
        replies: [...selectedQuestion.replies, reply]
      };

      setSelectedQuestion(updated);
      setQuestions(prev =>
        prev.map(q => q.id === selectedQuestion.id ? updated : q)
      );

      setNewReply('');
      return;
    }

    // ✅ Only for DB questions
    const res = await fetch(
      `http://localhost:5000/api/community/questions/${selectedQuestion.id}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "userid": loggedInUserId
        },
        body: JSON.stringify({ content: newReply })
      }
    );

    const data = await res.json();

    const updated = formatQuestion(data.question);

    setSelectedQuestion(updated);
    setQuestions(prev =>
      prev.map(q => q.id === updated.id ? updated : q)
    );

    setNewReply('');
  };

  const handleBack = () => {
    if (selectedQuestion) {
      setSelectedQuestion(null);
    } else if (showAskForm) {
      setShowAskForm(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <button className="backButton" onClick={handleBack}>←</button>
        <h1 className="headerTitle">
          {selectedQuestion ? 'Question Details' : showAskForm ? 'Ask a Question' : 'Community & Experts'}
        </h1>
      </header>

      {/* Tabs - Only show when not in ask form or viewing replies */}
      {!showAskForm && !selectedQuestion && (
        <div className="tabContainer">
          <button 
            className={`tab ${activeTab === 'forum' ? 'tabActive' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            Community Forum
          </button>
        </div>
      )}

      {/* Content */}
      <main className="content">
        {/* Ask Question Form */}
        {showAskForm && (
          <div className="askForm">
            <div className="formGroup">
              <label className="label">Question Title *</label>
              <input
                type="text"
                className="input"
                placeholder="Enter your question title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
              />
            </div>

            <div className="formGroup">
              <label className="label">Description *</label>
              <textarea
                className="textarea"
                placeholder="Provide detailed description of your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                rows={6}
              />
            </div>

            <button className="submitButton" onClick={handleSubmitQuestion}>
              Post Question
            </button>
          </div>
        )}

        {/* Question Details with Replies */}
        {selectedQuestion && (
          <div className="detailsView">
            {/* Original Question */}
            <div className="questionDetailCard">
              <div className="questionHeader">
                <div 
                  className="avatar"
                    style={{ background: getRandomColor(0) }}
                >
                  {getInitials(selectedQuestion.author)}
                </div>
                <div className="authorInfo">
                  <div className="authorName">{selectedQuestion.author}</div>
                  <div className="authorMeta">
                    {selectedQuestion.location} • {selectedQuestion.timeAgo}
                  </div>
                </div>
                {selectedQuestion.solved && (
                  <div className="solvedBadge">
                    <span className="solvedIcon">✓</span> Solved
                  </div>
                )}
              </div>

              <div className="questionContent">
                <h2 className="questionDetailTitle">{selectedQuestion.title}</h2>
                <p className="questionText">{selectedQuestion.content}</p>
              </div>

              <div className="questionFooter">
                <button className="actionButton">
                  <span className="actionIcon">👍</span>
                  <span className="actionText">{selectedQuestion.likes}</span>
                </button>
              </div>
            </div>

            {/* Replies Section */}
            <div className="repliesSection">
              <h3 className="repliesTitle">
                Replies ({selectedQuestion.replies.length})
              </h3>

              {selectedQuestion.replies.map((reply, index) => (
                <div key={reply.id} className="replyCard">
                  <div className="replyHeader">
                    <div 
                      className="avatarSmall"
                      style={{
                        background: getRandomColor(reply.id)
                      }}
                    >
                      {getInitials(reply.author)}
                    </div>
                    <div className="authorInfo">
                      <div className="replyAuthorName">{reply.author}</div>
                      <div className="authorMeta">
                        {reply.location} • {reply.timeAgo}
                      </div>
                    </div>
                  </div>
                  <p className="replyText">{reply.content}</p>
                  <button className="actionButton">
                    <span className="actionIcon">👍</span>
                    <span className="actionText">{reply.likes}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="replyInputSection">
              <textarea
                className="replyInput"
                placeholder="Write your reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={3}
              />
              <button className="replyButton" onClick={handleSubmitReply}>
                Post Reply
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {!showAskForm && !selectedQuestion && (
          <>
            <button className="askButton" onClick={handleAskQuestion}>
              <span className="askIcon">💬</span>
              Ask a Question
            </button>

            <div className="questionsList">
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="questionCard"
                  onClick={() => handleViewReplies(question)}
                >
                  <div className="questionHeader">
                    <div 
                      className="avatar"
                      style={{
                        background: getRandomColor(index)
                      }}
                    >
                      {getInitials(question.author)}
                    </div>
                    <div className="authorInfo">
                      <div className="authorName">{question.author}</div>
                      <div className="authorMeta">
                        {question.location} • {question.timeAgo}
                      </div>
                    </div>
                    {question.solved && (
                      <div className="solvedBadge">
                        <span className="solvedIcon">✓</span> Solved
                      </div>
                    )}
                  </div>

                  <div className="questionContent">
                    <h3 className="questionTitle">{question.title}</h3>
                    <p className="questionText">{question.content}</p>
                  </div>

                  <div className="questionFooter">
                    <button className="actionButton" onClick={(e) => e.stopPropagation()}>
                      <span className="actionIcon">👍</span>
                      <span className="actionText">{question.likes}</span>
                    </button>
                    <button className="actionButton">
                      <span className="actionIcon">💬</span>
                      <span className="actionText">{question.replies.length} Replies</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <Footer />
    </div>
  );
};

export default CommunityExpertsScreen;