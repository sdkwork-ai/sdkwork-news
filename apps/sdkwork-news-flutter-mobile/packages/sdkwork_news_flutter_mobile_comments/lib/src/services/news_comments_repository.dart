import '../models/news_comment.dart';

abstract interface class NewsCommentsRepository {
  Future<NewsCommentsPage> list(
    String articleId, {
    int page = 1,
    int pageSize = 10,
  });

  Future<NewsComment> create(
    String articleId, {
    required String body,
    String? parentId,
  });

  Future<void> delete(String articleId, String commentId);

  Future<NewsCommentsSummary> summary(String articleId);

  Future<void> setLike(
    String articleId,
    String commentId,
    bool liked,
  );

  Future<NewsEngagementState> engagement(String articleId);

  Future<void> setFavorite(String articleId, bool favorite);

  Future<void> setArticleLike(String articleId, bool liked);

  Future<void> recordVisit(String articleId);
}

class UnavailableNewsCommentsRepository implements NewsCommentsRepository {
  const UnavailableNewsCommentsRepository();

  @override
  Future<NewsComment> create(
    String articleId, {
    required String body,
    String? parentId,
  }) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<void> delete(String articleId, String commentId) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<NewsEngagementState> engagement(String articleId) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<NewsCommentsPage> list(
    String articleId, {
    int page = 1,
    int pageSize = 10,
  }) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<void> recordVisit(String articleId) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<void> setArticleLike(String articleId, bool liked) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<void> setFavorite(String articleId, bool favorite) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<void> setLike(String articleId, String commentId, bool liked) =>
      Future.error(StateError('Comments service is unavailable'));

  @override
  Future<NewsCommentsSummary> summary(String articleId) =>
      Future.error(StateError('Comments service is unavailable'));
}

class DemoNewsCommentsRepository implements NewsCommentsRepository {
  DemoNewsCommentsRepository();

  final Map<String, List<NewsComment>> _comments = {};
  final Map<String, NewsEngagementState> _engagement = {};

  @override
  Future<NewsComment> create(
    String articleId, {
    required String body,
    String? parentId,
  }) async {
    final comments = _ensure(articleId);
    final now = DateTime.now().toUtc();
    final comment = NewsComment(
      id: 'comment-$articleId-${now.microsecondsSinceEpoch}',
      authorId: 'viewer',
      authorName: '我',
      body: body.trim(),
      createdAt: now,
      likeCount: 0,
      replyCount: 0,
      viewerLiked: false,
      parentId: parentId,
    );
    _comments[articleId] = [comment, ...comments];
    if (parentId != null) {
      _comments[articleId] = _comments[articleId]!
          .map((entry) => entry.id == parentId
              ? NewsComment(
                  id: entry.id,
                  authorId: entry.authorId,
                  authorName: entry.authorName,
                  body: entry.body,
                  createdAt: entry.createdAt,
                  likeCount: entry.likeCount,
                  replyCount: entry.replyCount + 1,
                  viewerLiked: entry.viewerLiked,
                  avatarUrl: entry.avatarUrl,
                  parentId: entry.parentId,
                  quoteAuthorName: entry.quoteAuthorName,
                )
              : entry)
          .toList(growable: false);
    }
    return comment;
  }

  @override
  Future<void> delete(String articleId, String commentId) async {
    _comments[articleId] = _ensure(articleId)
        .where((comment) => comment.id != commentId)
        .toList(growable: false);
  }

  @override
  Future<NewsCommentsPage> list(
    String articleId, {
    int page = 1,
    int pageSize = 10,
  }) async {
    final comments = _ensure(articleId);
    final safeSize = pageSize.clamp(1, 50);
    final start = (page - 1) * safeSize;
    final items = start >= comments.length
        ? const <NewsComment>[]
        : comments.sublist(start, (start + safeSize).clamp(0, comments.length));
    return NewsCommentsPage(
      items: List.unmodifiable(items),
      hasMore: start + items.length < comments.length,
      page: page,
      totalItems: comments.length,
    );
  }

  @override
  Future<void> setLike(
    String articleId,
    String commentId,
    bool liked,
  ) async {
    final comments = _ensure(articleId);
    _comments[articleId] = comments.map((comment) {
      if (comment.id != commentId || comment.viewerLiked == liked) {
        return comment;
      }
      return comment.copyWith(
        likeCount: (comment.likeCount + (liked ? 1 : -1)).clamp(0, 1 << 30),
        viewerLiked: liked,
      );
    }).toList(growable: false);
  }

  @override
  Future<NewsCommentsSummary> summary(String articleId) async {
    final comments = _ensure(articleId);
    final latest = comments.isEmpty ? DateTime.fromMillisecondsSinceEpoch(0) : comments.first.createdAt;
    return NewsCommentsSummary(
      publishedCount: comments.length,
      replyCount: comments.where((comment) => comment.parentId != null).length,
      totalCount: comments.length,
      latestActivityAt: latest,
    );
  }

  @override
  Future<NewsEngagementState> engagement(String articleId) async {
    return _engagement.putIfAbsent(
      articleId,
      () => const NewsEngagementState(
        favorited: false,
        liked: false,
        summary: NewsEngagementSummary(
          favoriteCount: 128,
          likeCount: 356,
          visitCount: 1024,
        ),
      ),
    );
  }

  @override
  Future<void> recordVisit(String articleId) async {
    final current = await engagement(articleId);
    _engagement[articleId] = NewsEngagementState(
      favorited: current.favorited,
      liked: current.liked,
      summary: NewsEngagementSummary(
        favoriteCount: current.summary.favoriteCount,
        likeCount: current.summary.likeCount,
        visitCount: current.summary.visitCount + 1,
      ),
    );
  }

  @override
  Future<void> setArticleLike(String articleId, bool liked) async {
    final current = await engagement(articleId);
    if (current.liked == liked) {
      return;
    }
    _engagement[articleId] = NewsEngagementState(
      favorited: current.favorited,
      liked: liked,
      summary: NewsEngagementSummary(
        favoriteCount: current.summary.favoriteCount,
        likeCount: (current.summary.likeCount + (liked ? 1 : -1))
            .clamp(0, 1 << 30),
        visitCount: current.summary.visitCount,
      ),
    );
  }

  @override
  Future<void> setFavorite(String articleId, bool favorite) async {
    final current = await engagement(articleId);
    if (current.favorited == favorite) {
      return;
    }
    _engagement[articleId] = NewsEngagementState(
      favorited: favorite,
      liked: current.liked,
      summary: NewsEngagementSummary(
        favoriteCount: (current.summary.favoriteCount + (favorite ? 1 : -1))
            .clamp(0, 1 << 30),
        likeCount: current.summary.likeCount,
        visitCount: current.summary.visitCount,
      ),
    );
  }

  List<NewsComment> _ensure(String articleId) {
    return _comments.putIfAbsent(articleId, () => _seed(articleId));
  }

  List<NewsComment> _seed(String articleId) {
    final now = DateTime.now().toUtc();
    return [
      NewsComment(
        id: '$articleId-seed-1',
        authorId: 'seed-1',
        authorName: '周屿',
        body: '更关心来源是否可追溯，以及后续有没有持续更新。',
        createdAt: now.subtract(const Duration(minutes: 18)),
        likeCount: 24,
        replyCount: 1,
        viewerLiked: false,
      ),
      NewsComment(
        id: '$articleId-seed-2',
        authorId: 'seed-2',
        authorName: '林一',
        body: '摘要里的关键判断很清楚，建议再补一段对行业影响的拆解。',
        createdAt: now.subtract(const Duration(minutes: 46)),
        likeCount: 12,
        replyCount: 0,
        viewerLiked: true,
        parentId: '$articleId-seed-1',
        quoteAuthorName: '周屿',
      ),
      NewsComment(
        id: '$articleId-seed-3',
        authorId: 'seed-3',
        authorName: '陈默',
        body: '这类内容适合加入每日简报，尤其是政策和技术交叉的部分。',
        createdAt: now.subtract(const Duration(hours: 2)),
        likeCount: 7,
        replyCount: 0,
        viewerLiked: false,
      ),
    ];
  }
}
