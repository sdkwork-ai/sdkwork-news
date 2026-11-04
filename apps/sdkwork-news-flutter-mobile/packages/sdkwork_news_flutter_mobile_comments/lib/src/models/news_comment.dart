class NewsComment {
  const NewsComment({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.body,
    required this.createdAt,
    required this.likeCount,
    required this.replyCount,
    required this.viewerLiked,
    this.avatarUrl,
    this.parentId,
    this.quoteAuthorName,
  });

  final String id;
  final String authorId;
  final String authorName;
  final String body;
  final DateTime createdAt;
  final int likeCount;
  final int replyCount;
  final bool viewerLiked;
  final String? avatarUrl;
  final String? parentId;
  final String? quoteAuthorName;

  NewsComment copyWith({
    int? likeCount,
    bool? viewerLiked,
  }) {
    return NewsComment(
      id: id,
      authorId: authorId,
      authorName: authorName,
      body: body,
      createdAt: createdAt,
      likeCount: likeCount ?? this.likeCount,
      replyCount: replyCount,
      viewerLiked: viewerLiked ?? this.viewerLiked,
      avatarUrl: avatarUrl,
      parentId: parentId,
      quoteAuthorName: quoteAuthorName,
    );
  }
}

class NewsCommentsSummary {
  const NewsCommentsSummary({
    required this.publishedCount,
    required this.replyCount,
    required this.totalCount,
    required this.latestActivityAt,
  });

  final int publishedCount;
  final int replyCount;
  final int totalCount;
  final DateTime latestActivityAt;
}

class NewsCommentsPage {
  const NewsCommentsPage({
    required this.items,
    required this.hasMore,
    required this.page,
    required this.totalItems,
  });

  final List<NewsComment> items;
  final bool hasMore;
  final int page;
  final int totalItems;
}

class NewsEngagementSummary {
  const NewsEngagementSummary({
    required this.favoriteCount,
    required this.likeCount,
    required this.visitCount,
  });

  final int favoriteCount;
  final int likeCount;
  final int visitCount;
}

class NewsEngagementState {
  const NewsEngagementState({
    required this.favorited,
    required this.liked,
    required this.summary,
  });

  final bool favorited;
  final bool liked;
  final NewsEngagementSummary summary;
}

