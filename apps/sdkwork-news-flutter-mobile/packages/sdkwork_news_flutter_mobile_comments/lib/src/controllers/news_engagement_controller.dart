import 'package:flutter/foundation.dart';

import '../models/news_comment.dart';
import '../services/news_comments_repository.dart';

class NewsEngagementController extends ChangeNotifier {
  NewsEngagementController(
    this._repository, {
    required this.articleId,
  });

  final NewsCommentsRepository _repository;
  final String articleId;

  NewsEngagementSummary summary = const NewsEngagementSummary(
    favoriteCount: 0,
    likeCount: 0,
    visitCount: 0,
  );
  bool favorited = false;
  bool liked = false;
  bool isFavoritePending = false;
  bool isLikePending = false;
  String? errorMessage;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) {
      return;
    }
    _initialized = true;
    try {
      await _repository.recordVisit(articleId);
      final state = await _repository.engagement(articleId);
      favorited = state.favorited;
      liked = state.liked;
      summary = state.summary;
    } catch (error) {
      errorMessage = '$error';
    }
    notifyListeners();
  }

  Future<void> toggleFavorite() async {
    if (isFavoritePending) {
      return;
    }
    final next = !favorited;
    isFavoritePending = true;
    favorited = next;
    summary = NewsEngagementSummary(
      favoriteCount: (summary.favoriteCount + (next ? 1 : -1))
          .clamp(0, 1 << 30),
      likeCount: summary.likeCount,
      visitCount: summary.visitCount,
    );
    notifyListeners();
    try {
      await _repository.setFavorite(articleId, next);
      errorMessage = null;
    } catch (error) {
      favorited = !next;
      summary = NewsEngagementSummary(
        favoriteCount: (summary.favoriteCount + (next ? -1 : 1))
            .clamp(0, 1 << 30),
        likeCount: summary.likeCount,
        visitCount: summary.visitCount,
      );
      errorMessage = '$error';
    } finally {
      isFavoritePending = false;
      notifyListeners();
    }
  }

  Future<void> toggleLike() async {
    if (isLikePending) {
      return;
    }
    final next = !liked;
    isLikePending = true;
    liked = next;
    summary = NewsEngagementSummary(
      favoriteCount: summary.favoriteCount,
      likeCount: (summary.likeCount + (next ? 1 : -1)).clamp(0, 1 << 30),
      visitCount: summary.visitCount,
    );
    notifyListeners();
    try {
      await _repository.setArticleLike(articleId, next);
      errorMessage = null;
    } catch (error) {
      liked = !next;
      summary = NewsEngagementSummary(
        favoriteCount: summary.favoriteCount,
        likeCount: (summary.likeCount + (next ? -1 : 1)).clamp(0, 1 << 30),
        visitCount: summary.visitCount,
      );
      errorMessage = '$error';
    } finally {
      isLikePending = false;
      notifyListeners();
    }
  }
}
