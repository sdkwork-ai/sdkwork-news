import 'package:flutter/foundation.dart';

import '../models/news_comment.dart';
import '../services/news_comments_repository.dart';

class NewsCommentsController extends ChangeNotifier {
  NewsCommentsController(
    this._repository, {
    required this.articleId,
    this.articleTitle,
    this.pageSize = 8,
  });

  final NewsCommentsRepository _repository;
  final String articleId;
  final String? articleTitle;
  final int pageSize;

  List<NewsComment> comments = const [];
  NewsCommentsSummary? summary;
  String? errorMessage;
  String? actionErrorMessage;
  bool isLoading = false;
  bool isLoadingMore = false;
  bool isSubmitting = false;
  bool hasMore = false;
  int page = 1;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) {
      return;
    }
    _initialized = true;
    await refresh();
  }

  Future<void> refresh() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      final results = await Future.wait<Object>([
        _repository.list(articleId, page: 1, pageSize: pageSize),
        _repository.summary(articleId),
      ]);
      comments = List.unmodifiable((results[0] as NewsCommentsPage).items);
      hasMore = (results[0] as NewsCommentsPage).hasMore;
      page = 1;
      summary = results[1] as NewsCommentsSummary;
    } catch (error) {
      errorMessage = '$error';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMore() async {
    if (!hasMore || isLoadingMore) {
      return;
    }
    isLoadingMore = true;
    notifyListeners();
    try {
      final next = await _repository.list(
        articleId,
        page: page + 1,
        pageSize: pageSize,
      );
      final seen = comments.map((comment) => comment.id).toSet();
      comments = List.unmodifiable([
        ...comments,
        ...next.items.where((comment) => !seen.contains(comment.id)),
      ]);
      hasMore = next.hasMore;
      page = page + 1;
    } catch (error) {
      actionErrorMessage = '$error';
    } finally {
      isLoadingMore = false;
      notifyListeners();
    }
  }

  Future<bool> submit(String body, {String? parentId}) async {
    final normalized = body.trim();
    if (normalized.isEmpty || isSubmitting) {
      return false;
    }
    isSubmitting = true;
    actionErrorMessage = null;
    notifyListeners();
    try {
      final comment = await _repository.create(
        articleId,
        body: normalized,
        parentId: parentId,
      );
      comments = List.unmodifiable([comment, ...comments]);
      final current = summary;
      if (current != null) {
        summary = NewsCommentsSummary(
          publishedCount: current.publishedCount + 1,
          replyCount: current.replyCount + (parentId == null ? 0 : 1),
          totalCount: current.totalCount + 1,
          latestActivityAt: comment.createdAt,
        );
      }
      return true;
    } catch (error) {
      actionErrorMessage = '$error';
      return false;
    } finally {
      isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> toggleLike(String commentId) async {
    final index = comments.indexWhere((comment) => comment.id == commentId);
    if (index < 0) {
      return;
    }
    final current = comments[index];
    final nextLiked = !current.viewerLiked;
    final next = [
      for (final comment in comments)
        if (comment.id == commentId)
          comment.copyWith(
            likeCount: (comment.likeCount + (nextLiked ? 1 : -1))
                .clamp(0, 1 << 30),
            viewerLiked: nextLiked,
          )
        else
          comment,
    ];
    comments = List.unmodifiable(next);
    notifyListeners();
    try {
      await _repository.setLike(articleId, commentId, nextLiked);
    } catch (error) {
      comments = List.unmodifiable([
        for (final comment in comments)
          if (comment.id == commentId) current else comment,
      ]);
      actionErrorMessage = '$error';
      notifyListeners();
    }
  }

  Future<void> remove(String commentId) async {
    try {
      await _repository.delete(articleId, commentId);
      comments = List.unmodifiable(
        comments.where((comment) => comment.id != commentId),
      );
      final current = summary;
      if (current != null) {
        summary = NewsCommentsSummary(
          publishedCount: (current.publishedCount - 1).clamp(0, 1 << 30),
          replyCount: current.replyCount,
          totalCount: (current.totalCount - 1).clamp(0, 1 << 30),
          latestActivityAt: current.latestActivityAt,
        );
      }
      notifyListeners();
    } catch (error) {
      actionErrorMessage = '$error';
      notifyListeners();
    }
  }
}
