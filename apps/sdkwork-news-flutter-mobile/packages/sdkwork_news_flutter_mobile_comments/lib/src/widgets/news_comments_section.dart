import 'package:flutter/material.dart';
import 'package:sdkwork_news_flutter_mobile_commons/sdkwork_news_flutter_mobile_commons.dart';

import '../controllers/news_comments_controller.dart';
import '../models/news_comment.dart';

class NewsCommentsSection extends StatefulWidget {
  const NewsCommentsSection({
    super.key,
    required this.controller,
  });

  final NewsCommentsController controller;

  @override
  State<NewsCommentsSection> createState() => _NewsCommentsSectionState();
}

class _NewsCommentsSectionState extends State<NewsCommentsSection> {
  final _input = TextEditingController();
  String? _replyToId;
  String? _replyToName;

  @override
  void initState() {
    super.initState();
    widget.controller.initialize();
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final body = _input.text.trim();
    if (body.isEmpty) {
      return;
    }
    final succeeded = await widget.controller.submit(
      body,
      parentId: _replyToId,
    );
    if (!mounted) {
      return;
    }
    if (succeeded) {
      _input.clear();
      setState(() {
        _replyToId = null;
        _replyToName = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(NewsStrings.of(context).text('comments.published'))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final strings = NewsStrings.of(context);
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        final controller = widget.controller;
        final count = controller.summary?.publishedCount ?? controller.comments.length;
        return Container(
          margin: const EdgeInsets.only(top: 26),
          padding: const EdgeInsets.only(top: 20),
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: Theme.of(context).colorScheme.outline),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    strings.text('comments.title'),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: NewsPalette.primarySoft,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '$count',
                      style: const TextStyle(
                        color: NewsPalette.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const Spacer(),
                  const Text(
                    '理性讨论 · 尊重事实',
                    style: TextStyle(color: NewsPalette.muted, fontSize: 9),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              if (_replyToName != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          strings
                              .text('comments.replyingTo')
                              .replaceAll('{name}', _replyToName ?? ''),
                          style: const TextStyle(
                            color: NewsPalette.primary,
                            fontSize: 10,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () => setState(() {
                          _replyToId = null;
                          _replyToName = null;
                        }),
                        child: Text(strings.text('comments.cancelReply')),
                      ),
                    ],
                  ),
                ),
              TextField(
                controller: _input,
                maxLength: 300,
                maxLines: 3,
                minLines: 2,
                decoration: InputDecoration(
                  hintText: _replyToName == null
                      ? strings.text('comments.placeholder')
                      : strings
                          .text('comments.replyPlaceholder')
                          .replaceAll('{name}', _replyToName ?? ''),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    '${_input.text.length}/300',
                    style: const TextStyle(color: NewsPalette.muted, fontSize: 9),
                  ),
                  const Spacer(),
                  FilledButton.icon(
                    onPressed: controller.isSubmitting ? null : _submit,
                    icon: controller.isSubmitting
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send_rounded, size: 15),
                    label: Text(
                      controller.isSubmitting
                          ? strings.text('comments.sending')
                          : strings.text('comments.send'),
                    ),
                  ),
                ],
              ),
              if (controller.isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (controller.errorMessage != null)
                _StateMessage(
                  title: strings.text('comments.loadFailed'),
                  body: controller.errorMessage!,
                  actionLabel: strings.text('comments.loadMore'),
                  onAction: controller.refresh,
                )
              else if (controller.comments.isEmpty)
                _StateMessage(
                  title: strings.text('comments.empty'),
                  body: strings.text('comments.emptyHint'),
                )
              else
                Column(
                  children: [
                    for (final comment in controller.comments)
                      _CommentTile(
                        comment: comment,
                        onLike: () => controller.toggleLike(comment.id),
                        onReply: () => setState(() {
                          _replyToId = comment.id;
                          _replyToName = comment.authorName;
                        }),
                        onRemove: comment.authorId == 'viewer'
                            ? () => controller.remove(comment.id)
                            : null,
                      ),
                    if (controller.hasMore)
                      TextButton(
                        onPressed: controller.isLoadingMore
                            ? null
                            : controller.loadMore,
                        child: Text(strings.text('comments.loadMore')),
                      ),
                  ],
                ),
              if (controller.actionErrorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    controller.actionErrorMessage!,
                    style: const TextStyle(
                      color: NewsPalette.danger,
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({
    required this.comment,
    required this.onLike,
    required this.onReply,
    required this.onRemove,
  });

  final NewsComment comment;
  final VoidCallback onLike;
  final VoidCallback onReply;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: NewsPalette.primarySoft,
            child: Text(
              comment.authorName.isEmpty
                  ? '?'
                  : comment.authorName.substring(0, 1),
              style: const TextStyle(
                color: NewsPalette.primary,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      comment.authorName,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (comment.quoteAuthorName != null) ...[
                      const SizedBox(width: 6),
                      Text(
                        '回复 @${comment.quoteAuthorName}',
                        style: const TextStyle(
                          color: NewsPalette.primary,
                          fontSize: 9,
                        ),
                      ),
                    ],
                    const Spacer(),
                    Text(
                      _relativeTime(comment.createdAt),
                      style: const TextStyle(
                        color: NewsPalette.muted,
                        fontSize: 9,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  comment.body,
                  style: const TextStyle(fontSize: 13, height: 1.65),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    InkWell(
                      onTap: onLike,
                      child: Row(
                        children: [
                          Icon(
                            comment.viewerLiked
                                ? Icons.favorite_rounded
                                : Icons.favorite_border_rounded,
                            size: 14,
                            color: comment.viewerLiked
                                ? NewsPalette.primary
                                : NewsPalette.muted,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            comment.likeCount > 0
                                ? '${comment.likeCount}'
                                : '赞',
                            style: TextStyle(
                              color: comment.viewerLiked
                                  ? NewsPalette.primary
                                  : NewsPalette.muted,
                              fontSize: 9,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 18),
                    InkWell(
                      onTap: onReply,
                      child: const Text(
                        '回复',
                        style: TextStyle(
                          color: NewsPalette.muted,
                          fontSize: 9,
                        ),
                      ),
                    ),
                    if (onRemove != null) ...[
                      const SizedBox(width: 18),
                      InkWell(
                        onTap: onRemove,
                        child: const Text(
                          '删除',
                          style: TextStyle(
                            color: NewsPalette.muted,
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StateMessage extends StatelessWidget {
  const _StateMessage({
    required this.title,
    required this.body,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 26),
      child: Center(
        child: Column(
          children: [
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            ),
            const SizedBox(height: 5),
            Text(
              body,
              textAlign: TextAlign.center,
              style: const TextStyle(color: NewsPalette.muted, fontSize: 10),
            ),
            if (onAction != null) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: onAction,
                child: Text(actionLabel ?? ''),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

String _relativeTime(DateTime value) {
  final minutes = DateTime.now().toUtc().difference(value.toUtc()).inMinutes;
  if (minutes < 1) {
    return '刚刚';
  }
  if (minutes < 60) {
    return '$minutes 分钟前';
  }
  final hours = minutes ~/ 60;
  if (hours < 24) {
    return '$hours 小时前';
  }
  return '${hours ~/ 24} 天前';
}
