import 'package:sdkwork_comments_app_sdk_flutter/sdkwork_comments_app_sdk_flutter.dart';
import 'package:sdkwork_news_flutter_mobile_comments/sdkwork_news_flutter_mobile_comments.dart';

class SdkworkNewsCommentsRepository implements NewsCommentsRepository {
  SdkworkNewsCommentsRepository(this._client);

  final SdkworkAppClient _client;
  final Map<String, String> _threadIds = {};

  @override
  Future<NewsCommentsPage> list(
    String articleId, {
    int page = 1,
    int pageSize = 10,
  }) async {
    final threadId = await _threadId(articleId);
    final response = await _client.comments.list(
      threadId,
      page,
      pageSize,
      null,
      null,
      null,
      'newest',
    );
    final data = _data(response?.data);
    final items = _list(data?['items'])
        .map(_map)
        .whereType<Map<String, dynamic>>()
        .map((json) => _mapComment(Comment.fromJson(json)))
        .toList(growable: false);
    final pageInfo = _map(data?['pageInfo']);
    return NewsCommentsPage(
      items: List.unmodifiable(items),
      hasMore: pageInfo?['hasMore'] == true,
      page: _int(pageInfo?['page']) ?? page,
      totalItems: _int(pageInfo?['totalItems']) ?? items.length,
    );
  }

  @override
  Future<NewsComment> create(
    String articleId, {
    required String body,
    String? parentId,
  }) async {
    final threadId = await _threadId(articleId);
    final response = await _client.comments.create(
      threadId,
      CommentCreateRequest(
        body: body,
        parentId: parentId,
        authorName: '我',
      ),
    );
    final data = _data(response?.data);
    final item = _map(data?['item']);
    final comment = _map(item?['comment']);
    if (comment == null) {
      throw const FormatException('Comments create response is missing item.comment');
    }
    return _mapComment(Comment.fromJson(comment));
  }

  @override
  Future<void> delete(String articleId, String commentId) async {
    await _threadId(articleId);
    await _client.comments.delete(commentId);
  }

  @override
  Future<void> setLike(
    String articleId,
    String commentId,
    bool liked,
  ) async {
    await _threadId(articleId);
    if (liked) {
      await _client.comments.reactionsUpdate(commentId, 'like');
    } else {
      await _client.comments.reactionsDelete(commentId, 'like');
    }
  }

  @override
  Future<NewsCommentsSummary> summary(String articleId) async {
    final threadId = await _threadId(articleId);
    final response = await _client.comments.threadsRetrieve(threadId);
    final data = _data(response?.data);
    final item = _map(data?['item']);
    final summary = _map(item?['summary']);
    if (summary == null) {
      throw const FormatException('Comments summary response is missing item.summary');
    }
    return NewsCommentsSummary(
      publishedCount: _int(summary['publishedCount']) ?? 0,
      replyCount: _int(summary['replyCount']) ?? 0,
      totalCount: _int(summary['totalCount']) ?? 0,
      latestActivityAt: DateTime.tryParse(
            summary['latestActivityAt']?.toString() ?? '',
          )?.toUtc() ??
          DateTime.fromMillisecondsSinceEpoch(0, isUtc: true),
    );
  }

  @override
  Future<NewsEngagementState> engagement(String articleId) async {
    final responses = await Future.wait<dynamic>([
      _client.engagement.targetsRetrieve('news-item', articleId),
      _client.engagement.favoritesList(null, 50, 'news-item', articleId),
    ]);
    final summaryData = _data(responses[0]?.data);
    final summaryItem = _map(summaryData?['item']);
    final summary = _map(summaryItem?['summary']);
    final favoritesData = _data(responses[1]?.data);
    final favorites = _list(favoritesData?['items'])
        .map(_map)
        .whereType<Map<String, dynamic>>();
    final favorited = favorites.any(
      (favorite) =>
          favorite['targetId'] == articleId
          && favorite['targetKind'] == 'news-item',
    );
    final reactionCounts = _map(summary?['reactionCounts']);
    return NewsEngagementState(
      favorited: favorited,
      liked: false,
      summary: NewsEngagementSummary(
        favoriteCount: _int(summary?['favoriteCount']) ?? 0,
        likeCount: _int(reactionCounts?['like']) ?? 0,
        visitCount: _int(summary?['visitCount']) ?? 0,
      ),
    );
  }

  @override
  Future<void> recordVisit(String articleId) async {
    await _client.engagement.visitsCreate(
      'news-item',
      articleId,
      EngagementVisitCreateRequest(source: 'news-article'),
    );
  }

  @override
  Future<void> setArticleLike(String articleId, bool liked) async {
    if (liked) {
      await _client.engagement.likesUpdate('news-item', articleId);
    } else {
      await _client.engagement.likesDelete('news-item', articleId);
    }
  }

  @override
  Future<void> setFavorite(String articleId, bool favorite) async {
    if (favorite) {
      await _client.engagement.favoritesUpdate('news-item', articleId);
    } else {
      await _client.engagement.favoritesDelete('news-item', articleId);
    }
  }

  Future<String> _threadId(String articleId) async {
    final cached = _threadIds[articleId];
    if (cached != null) {
      return cached;
    }
    final response = await _client.comments.threadsEnsure(
      CommentsThreadEnsureRequest(
        ownerKind: 'news-item',
        ownerId: articleId,
      ),
    );
    final data = _data(response?.data);
    final item = _map(data?['item']);
    final threadId = item?['id']?.toString();
    if (threadId == null || threadId.isEmpty) {
      throw const FormatException('Comments ensure response is missing item.id');
    }
    _threadIds[articleId] = threadId;
    return threadId;
  }

  NewsComment _mapComment(Comment comment) {
    return NewsComment(
      id: comment.id,
      authorId: comment.authorId,
      authorName: comment.authorName?.trim().isNotEmpty == true
          ? comment.authorName!.trim()
          : '读者',
      body: comment.body,
      createdAt: DateTime.tryParse(comment.createdAt)?.toUtc() ??
          DateTime.fromMillisecondsSinceEpoch(0, isUtc: true),
      likeCount: comment.likeCount ?? 0,
      replyCount: comment.replyCount ?? 0,
      viewerLiked: comment.viewerLiked == true,
      avatarUrl: comment.authorAvatarUrl,
      parentId: comment.parentId,
      quoteAuthorName: comment.quote?.authorName,
    );
  }
}

Map<String, dynamic>? _data(dynamic value) => _map(value);

Map<String, dynamic>? _map(dynamic value) {
  if (value is Map<String, dynamic>) {
    return value;
  }
  if (value is Map) {
    return value.map((key, item) => MapEntry('$key', item));
  }
  return null;
}

Iterable<dynamic> _list(dynamic value) => value is List ? value : const [];

int? _int(dynamic value) {
  if (value is int) {
    return value;
  }
  return int.tryParse(value?.toString() ?? '');
}
